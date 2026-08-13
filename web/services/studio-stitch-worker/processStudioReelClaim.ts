import type { StudioReelWorkerClaimEnvelope } from "../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import type { StudioReelWorkerDurableOutput } from "../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerDurableOutput";
import { parseStudioStitchRecipe } from "../../lib/clipstitchr/studio/stitch/parseStudioStitchRecipe";
import type { StudioReelClaimProcessorDependencies } from "./contracts/StudioReelClaimProcessorDependencies";
import type { StudioReelExecutionSnapshot } from "./contracts/StudioReelExecutionSnapshot";
import { StudioReelWorkerError } from "./errors/StudioReelWorkerError";
import { createStudioReelExecutionSnapshot } from "./runtime/createStudioReelExecutionSnapshot";
import { getStudioReelProgressPercent } from "./runtime/getStudioReelProgressPercent";
import { getStudioReelProviderRequirement } from "./runtime/getStudioReelProviderRequirement";
import { readStudioReelExecutionSnapshot } from "./validation/readStudioReelExecutionSnapshot";

export async function processStudioReelClaim(
  claim: StudioReelWorkerClaimEnvelope,
  dependencies: StudioReelClaimProcessorDependencies,
): Promise<readonly StudioReelWorkerDurableOutput[]> {
  let revision = claim.resume?.revision ?? 0;
  let snapshot: StudioReelExecutionSnapshot = claim.resume
    ? readStudioReelExecutionSnapshot(claim.resume.snapshotJson)
    : createStudioReelExecutionSnapshot();
  const completed = new Set(snapshot.outputs.map((output) => output.recipeId));

  for (let recipeIndex = 0; recipeIndex < claim.recipes.length; recipeIndex += 1) {
    const claimedRecipe = claim.recipes[recipeIndex];
    if (completed.has(claimedRecipe.id)) continue;
    const recipe = parseStudioStitchRecipe(claimedRecipe.recipeJson);
    await dependencies.withWorkspace(async (workspace) => {
      await dependencies.assertActive("claim_validated", recipeIndex);
      let assets = await dependencies.acquireAssets(claimedRecipe, workspace);
      const reactionRequirement = getStudioReelProviderRequirement(
        recipe,
        "reactionFootage",
      );
      if (!reactionRequirement.satisfiedByInput) {
        let selections = snapshot.reactionSelections.filter(
          (selection) => selection.recipeId === recipe.id,
        );
        if (selections.length < 1) {
          await dependencies.assertActive("claim_validated", recipeIndex);
          await dependencies.reserve(
            "dansugc",
            recipe.id,
            `${recipe.id}_dansugc_search_${claim.runAttempt}`,
          );
          await dependencies.assertActive("claim_validated", recipeIndex);
          selections = [
            ...(await dependencies.selectReactionSources(recipe)),
          ];
          snapshot = {
            ...snapshot,
            reactionSelections: [
              ...snapshot.reactionSelections.filter(
                (selection) => selection.recipeId !== recipe.id,
              ),
              ...selections,
            ],
          };
          revision = await dependencies.checkpoint({
            checkpoint: "claim_validated",
            expectedRevision: revision,
            recipeIndex,
            snapshot,
          });
        }
        const checkpointAssets = snapshot.reactionAssets.filter(
          (asset) => asset.recipeId === recipe.id,
        );
        if (checkpointAssets.length > 0) {
          await dependencies.assertActive("sources_acquired", recipeIndex);
          assets = [
            ...assets,
            ...(await dependencies.restoreReactionAssets(
              checkpointAssets,
              workspace,
            )),
          ];
        } else {
          const acquired = await dependencies.acquireReactionAssets(
            recipe,
            selections,
            workspace,
          );
          assets = [...assets, ...acquired.assets];
          snapshot = {
            ...snapshot,
            reactionAssets: [
              ...snapshot.reactionAssets.filter(
                (asset) => asset.recipeId !== recipe.id,
              ),
              ...acquired.checkpointAssets,
            ],
          };
        }
      }
      await workspace.assertWithinBudget();
      await dependencies.progress({
        checkpoint: "sources_acquired",
        code: "sources_acquired",
        progressPercent: getStudioReelProgressPercent(
          recipeIndex,
          claim.recipes.length,
          "sources",
        ),
        recipeIndex,
      });
      revision = await dependencies.checkpoint({
        checkpoint: "sources_acquired",
        expectedRevision: revision,
        recipeIndex,
        snapshot,
      });

      const demoRequirement = getStudioReelProviderRequirement(
        recipe,
        "demoIntelligence",
      );
      if (
        !demoRequirement.satisfiedByInput &&
        !snapshot.analyses.some((entry) => entry.recipeId === recipe.id)
      ) {
        await dependencies.assertActive("sources_acquired", recipeIndex);
        await dependencies.reserve(
          "gemini",
          recipe.id,
          `${recipe.id}_gemini_${claim.runAttempt}`,
        );
        await dependencies.assertActive("sources_acquired", recipeIndex);
        const analysis = await dependencies.analyzeDemo(recipe, assets);
        snapshot = {
          ...snapshot,
          analyses: [...snapshot.analyses, { analysis, recipeId: recipe.id }],
        };
        revision = await dependencies.checkpoint({
          checkpoint: "gemini_ready",
          expectedRevision: revision,
          recipeIndex,
          snapshot,
        });
        await dependencies.progress({
          checkpoint: "gemini_ready",
          code: "gemini_ready",
          progressPercent: getStudioReelProgressPercent(
            recipeIndex,
            claim.recipes.length,
            "gemini",
          ),
          recipeIndex,
        });
      }

      let voice = undefined;
      if (recipe.pipeline === "talkingVideo") {
        const checkpointVoice = snapshot.voices.find(
          (entry) => entry.recipeId === recipe.id,
        );
        if (checkpointVoice) {
          await dependencies.assertActive("voice_ready", recipeIndex);
          voice = await dependencies.restoreVoice(checkpointVoice, workspace);
        } else {
          await dependencies.assertActive("gemini_ready", recipeIndex);
          await dependencies.reserve(
            "elevenlabs",
            recipe.id,
            `${recipe.id}_elevenlabs_${claim.runAttempt}`,
          );
          await dependencies.assertActive("gemini_ready", recipeIndex);
          voice = await dependencies.createVoice(recipe, workspace);
          await dependencies.assertActive("voice_ready", recipeIndex);
          const durableVoice = await dependencies.storeVoice({ recipe, voice });
          snapshot = {
            ...snapshot,
            voices: [...snapshot.voices, durableVoice],
          };
          revision = await dependencies.checkpoint({
            checkpoint: "voice_ready",
            expectedRevision: revision,
            recipeIndex,
            snapshot,
          });
        }
        await dependencies.progress({
          checkpoint: "voice_ready",
          code: "voice_ready",
          progressPercent: getStudioReelProgressPercent(
            recipeIndex,
            claim.recipes.length,
            "voice",
          ),
          recipeIndex,
        });
      }

      await dependencies.assertActive(
        recipe.pipeline === "talkingVideo" ? "voice_ready" : "gemini_ready",
        recipeIndex,
      );
      await dependencies.reserve(
        "render",
        recipe.id,
        `${recipe.id}_render_${claim.runAttempt}`,
      );
      const localOutput = await dependencies.render({
        assets,
        recipe,
        ...(voice ? { voice } : {}),
        workspace,
      });
      await workspace.assertWithinBudget();
      const probe = await dependencies.probeOutput(localOutput, workspace);
      if (
        Math.abs(probe.durationSeconds - recipe.durationSeconds) > 0.25 ||
        probe.width !== recipe.canvas.widthPixels ||
        probe.height !== recipe.canvas.heightPixels ||
        !["h264", "avc1"].includes(probe.videoCodec.toLowerCase()) ||
        (recipe.pipeline === "talkingVideo" && !probe.hasAudio)
      ) {
        throw new StudioReelWorkerError({
          code: "RENDERED_MEDIA_FACTS_INVALID",
          kind: "permanent",
          publicMessage: "The rendered Studio Stitch output does not match its recipe.",
        });
      }
      await dependencies.progress({
        checkpoint: "rendered",
        code: "rendered",
        progressPercent: getStudioReelProgressPercent(
          recipeIndex,
          claim.recipes.length,
          "rendered",
        ),
        recipeIndex,
      });
      revision = await dependencies.checkpoint({
        checkpoint: "rendered",
        expectedRevision: revision,
        recipeIndex,
        snapshot,
      });

      await dependencies.assertActive("rendered", recipeIndex);
      const stored = await dependencies.storeOutput({
        localPath: localOutput,
        probe,
        recipe,
      });
      const output: StudioReelWorkerDurableOutput = {
        ...(probe.audioCodec ? { audioCodec: probe.audioCodec } : {}),
        contentType: "video/mp4",
        durationSeconds: probe.durationSeconds,
        hasAudio: probe.hasAudio,
        height: probe.height,
        objectKey: stored.objectKey,
        objectVersion: stored.objectVersion,
        recipeId: recipe.id,
        sha256: stored.sha256,
        sizeBytes: stored.sizeBytes,
        videoCodec: probe.videoCodec,
        width: probe.width,
      };
      snapshot = { ...snapshot, outputs: [...snapshot.outputs, output] };
      revision = await dependencies.checkpoint({
        checkpoint: "output_stored",
        expectedRevision: revision,
        recipeIndex,
        snapshot,
      });
      await dependencies.progress({
        checkpoint: "output_stored",
        code: "output_stored",
        progressPercent: getStudioReelProgressPercent(
          recipeIndex,
          claim.recipes.length,
          "stored",
        ),
        recipeIndex,
      });
    });
  }
  if (
    snapshot.outputs.length !== claim.recipes.length ||
    claim.recipes.some(
      (recipe) => !snapshot.outputs.some((output) => output.recipeId === recipe.id),
    )
  ) {
    throw new StudioReelWorkerError({
      code: "OUTPUT_COVERAGE_INCOMPLETE",
      kind: "permanent",
      publicMessage: "Studio Stitch did not produce every frozen recipe output.",
    });
  }
  return snapshot.outputs;
}
