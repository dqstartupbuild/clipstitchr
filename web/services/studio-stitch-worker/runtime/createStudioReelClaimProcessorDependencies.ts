import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { StudioReelWorkerAssetManifest } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerAssetManifest";
import type { StudioReelWorkerClaimEnvelope } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import { acquireStudioReelRecipeAssets } from "../adapters/media/acquireStudioReelRecipeAssets";
import { acquireStudioReelDansUgcAssets } from "../adapters/dansugc/acquireStudioReelDansUgcAssets";
import { restoreStudioReelDansUgcAssets } from "../adapters/dansugc/restoreStudioReelDansUgcAssets";
import { searchStudioReelDansUgcVideos } from "../adapters/dansugc/searchStudioReelDansUgcVideos";
import { selectStudioReelDansUgcVideos } from "../adapters/dansugc/selectStudioReelDansUgcVideos";
import { probeStudioReelMedia } from "../adapters/media/probeStudioReelMedia";
import { createStudioReelElevenLabsVoice } from "../adapters/elevenlabs/createStudioReelElevenLabsVoice";
import { createStudioReelGeminiAnalysis } from "../adapters/gemini/createStudioReelGeminiAnalysis";
import { publishStudioReelProgress } from "../adapters/http/publishStudioReelProgress";
import { reserveStudioReelCost } from "../adapters/http/reserveStudioReelCost";
import { saveStudioReelCheckpoint } from "../adapters/http/saveStudioReelCheckpoint";
import { renderStudioReelRecipe } from "../adapters/render/renderStudioReelRecipe";
import type { StudioReelClaimProcessorDependencies } from "../contracts/StudioReelClaimProcessorDependencies";
import type { StudioReelCommandRunner } from "../contracts/StudioReelCommandRunner";
import type { StudioReelWorkerHttpClient } from "../contracts/StudioReelWorkerHttpClient";
import type { StudioReelWorkerR2ObjectStore } from "../contracts/StudioReelWorkerR2ObjectStore";
import type { StudioReelWorkerRuntimeConfig } from "../contracts/StudioReelWorkerRuntimeConfig";
import { StudioReelWorkerError } from "../errors/StudioReelWorkerError";
import { withStudioReelTempWorkspace } from "../workspace/withStudioReelTempWorkspace";
import { getStudioReelOutputObjectKey } from "./getStudioReelOutputObjectKey";
import { getStudioReelDemoAsset } from "./getStudioReelDemoAsset";
import { getStudioReelVoiceObjectKey } from "./getStudioReelVoiceObjectKey";
import { serializeStudioReelExecutionSnapshot } from "./serializeStudioReelExecutionSnapshot";
import { assertStudioReelClaimActive } from "./assertStudioReelClaimActive";

export function createStudioReelClaimProcessorDependencies(input: {
  claim: StudioReelWorkerClaimEnvelope;
  config: StudioReelWorkerRuntimeConfig;
  fetch?: typeof fetch;
  http: StudioReelWorkerHttpClient;
  objects: StudioReelWorkerR2ObjectStore;
  onStage?: (input: {
    checkpoint: import("../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerCheckpoint").StudioReelWorkerCheckpoint;
    progressPercent?: number;
    recipeIndex: number;
  }) => void;
  runner: StudioReelCommandRunner;
}): StudioReelClaimProcessorDependencies {
  const assertActive: StudioReelClaimProcessorDependencies["assertActive"] =
    assertStudioReelClaimActive.bind(null, {
      claim: input.claim,
      http: input.http,
      onStage: input.onStage,
    });
  return {
    acquireAssets: (recipe, workspace) =>
      acquireStudioReelRecipeAssets({
        assertActive: () =>
          assertActive(
            input.claim.resume?.checkpoint ?? "claim_validated",
            input.claim.recipes.findIndex((entry) => entry.id === recipe.id),
          ),
        claim: input.claim,
        ffprobePath: input.config.commands.ffprobePath,
        objects: input.objects,
        recipe,
        runner: input.runner,
        workspacePath: workspace.path,
      }),
    acquireReactionAssets: async (recipe, selections, workspace) => {
      const apiKey = input.config.providers.dansugcApiKey;
      const allowedDownloadHosts =
        input.config.providers.dansugcDownloadHosts;
      if (!apiKey || allowedDownloadHosts.length < 1) {
        throw new StudioReelWorkerError({
          code: "DANSUGC_READINESS_UNAVAILABLE",
          kind: "permanent",
          publicMessage:
            "This Studio Stitch recipe needs configured DanSUGC reaction sourcing.",
        });
      }
      const recipeIndex = input.claim.recipes.findIndex(
        (entry) => entry.id === recipe.id,
      );
      return acquireStudioReelDansUgcAssets({
        allowedDownloadHosts,
        apiKey,
        assertActive: () => assertActive("claim_validated", recipeIndex),
        claim: input.claim,
        fetch: input.fetch,
        ffprobePath: input.config.commands.ffprobePath,
        objects: input.objects,
        recipe,
        reserve: (invocationId) =>
          reserveStudioReelCost({
            claim: input.claim,
            http: input.http,
            invocationId,
            provider: "dansugc",
            recipeId: recipe.id,
          }),
        runner: input.runner,
        selections,
        workspacePath: workspace.path,
      });
    },
    analyzeDemo: async (recipe, assets) => {
      const apiKey = input.config.providers.geminiApiKey;
      const demo = getStudioReelDemoAsset(recipe, assets);
      if (!apiKey || !demo) {
        throw new StudioReelWorkerError({
          code: "GEMINI_READINESS_UNAVAILABLE",
          kind: "permanent",
          publicMessage:
            "This Studio Stitch recipe needs configured Gemini demo analysis.",
        });
      }
      const recipeIndex = input.claim.recipes.findIndex(
        (entry) => entry.id === recipe.id,
      );
      return createStudioReelGeminiAnalysis({
        apiKey,
        assertActive: () => assertActive("sources_acquired", recipeIndex),
        contentType: demo.manifest.contentType,
        fetch: input.fetch,
        localPath: demo.localPath,
        recipe,
      });
    },
    assertActive,
    checkpoint: async ({
      checkpoint,
      expectedRevision,
      recipeIndex,
      snapshot,
    }) => {
      input.onStage?.({ checkpoint, recipeIndex });
      const response = await saveStudioReelCheckpoint({
        checkpoint,
        claim: input.claim,
        expectedRevision,
        http: input.http,
        recipeIndex,
        snapshotJson: serializeStudioReelExecutionSnapshot(snapshot),
      });
      return response.revision;
    },
    createVoice: (recipe, workspace) => {
      const apiKey = input.config.providers.elevenLabsApiKey;
      if (!apiKey) {
        throw new StudioReelWorkerError({
          code: "ELEVENLABS_READINESS_UNAVAILABLE",
          kind: "permanent",
          publicMessage:
            "This talking Studio Stitch recipe needs configured ElevenLabs voice generation.",
        });
      }
      return createStudioReelElevenLabsVoice({
        apiKey,
        fetch: input.fetch,
        ffmpegPath: input.config.commands.ffmpegPath,
        ffprobePath: input.config.commands.ffprobePath,
        recipe,
        runner: input.runner,
        workspacePath: workspace.path,
      });
    },
    progress: ({ checkpoint, code, progressPercent, recipeIndex }) => {
      input.onStage?.({ checkpoint, progressPercent, recipeIndex });
      return publishStudioReelProgress({
        checkpoint,
        claim: input.claim,
        code,
        http: input.http,
        progressPercent,
        recipeIndex,
        state: "processing",
      }).then(() => undefined);
    },
    probeOutput: (localPath, workspace) =>
      probeStudioReelMedia({
        ffprobePath: input.config.commands.ffprobePath,
        localPath,
        runner: input.runner,
        workspacePath: workspace.path,
      }),
    render: ({ assets, recipe, voice, workspace }) =>
      renderStudioReelRecipe({
        assertActive: () =>
          assertActive(
            "rendered",
            input.claim.recipes.findIndex((entry) => entry.id === recipe.id),
          ),
        assets,
        ffmpegPath: input.config.commands.ffmpegPath,
        fontPath: input.config.commands.fontPath,
        recipe,
        runner: input.runner,
        ...(voice
          ? {
              timelineWordTimings: voice.timelineWordTimings,
              voicePath: voice.localPath,
            }
          : {}),
        workspacePath: workspace.path,
      }),
    reserve: (provider, recipeId, invocationId) =>
      reserveStudioReelCost({
        claim: input.claim,
        http: input.http,
        invocationId,
        provider,
        recipeId,
      }).then(() => undefined),
    restoreVoice: async (voice, workspace) => {
      const localPath = join(workspace.path, "restored-voice.m4a");
      const manifest: StudioReelWorkerAssetManifest = {
        contentType: voice.contentType,
        durationSeconds: voice.durationSeconds,
        hasAudio: true,
        objectKey: voice.objectKey,
        objectVersion: voice.objectVersion,
        sha256: voice.sha256,
        sizeBytes: voice.sizeBytes,
        source: { kind: "studioUpload", objectKey: voice.objectKey },
      };
      await input.objects.downloadFile({
        manifest,
        maximumBytes: 64 * 1024 * 1024,
        outputPath: localPath,
        ownerId: input.claim.ownerId,
      });
      return {
        localPath,
        rawDurationSeconds: voice.rawDurationSeconds,
        tempoFactor: voice.tempoFactor,
        timelineWordTimings: voice.timelineWordTimings,
      };
    },
    restoreReactionAssets: (assets, workspace) =>
      restoreStudioReelDansUgcAssets({
        assets,
        ffprobePath: input.config.commands.ffprobePath,
        objects: input.objects,
        ownerId: input.claim.ownerId,
        runner: input.runner,
        workspacePath: workspace.path,
      }),
    selectReactionSources: async (recipe) => {
      const apiKey = input.config.providers.dansugcApiKey;
      if (
        !apiKey ||
        input.config.providers.dansugcDownloadHosts.length < 1
      ) {
        throw new StudioReelWorkerError({
          code: "DANSUGC_READINESS_UNAVAILABLE",
          kind: "permanent",
          publicMessage:
            "This Studio Stitch recipe needs configured DanSUGC reaction sourcing.",
        });
      }
      return selectStudioReelDansUgcVideos(
        recipe,
        await searchStudioReelDansUgcVideos({
          apiKey,
          fetch: input.fetch,
          recipe,
        }),
      );
    },
    storeOutput: async ({ localPath, probe, recipe }) => {
      const proof = await input.objects.putFileVerified({
        contentType: "video/mp4",
        localPath,
        maximumBytes: 512 * 1024 * 1024,
        objectKey: getStudioReelOutputObjectKey({
          ownerId: input.claim.ownerId,
          productId: input.claim.productId,
          recipeId: recipe.id,
          runId: input.claim.runId,
        }),
        ownerId: input.claim.ownerId,
        sizeBytes: probe.sizeBytes,
      });
      return {
        objectKey: proof.objectKey,
        objectVersion: proof.objectVersion,
        sha256: proof.sha256Hex,
        sizeBytes: proof.sizeBytes,
      };
    },
    storeVoice: async ({ recipe, voice }) => {
      const file = await stat(voice.localPath);
      const proof = await input.objects.putFileVerified({
        contentType: "audio/mp4",
        localPath: voice.localPath,
        maximumBytes: 64 * 1024 * 1024,
        objectKey: getStudioReelVoiceObjectKey({
          ownerId: input.claim.ownerId,
          productId: input.claim.productId,
          recipeId: recipe.id,
          runAttempt: input.claim.runAttempt,
          runId: input.claim.runId,
        }),
        ownerId: input.claim.ownerId,
        sizeBytes: file.size,
      });
      return {
        contentType: "audio/mp4",
        durationSeconds: recipe.voice.targetDurationSeconds,
        objectKey: proof.objectKey,
        objectVersion: proof.objectVersion,
        rawDurationSeconds: voice.rawDurationSeconds,
        recipeId: recipe.id,
        sha256: proof.sha256Hex,
        sizeBytes: proof.sizeBytes,
        tempoFactor: voice.tempoFactor,
        timelineWordTimings: voice.timelineWordTimings,
      };
    },
    withWorkspace: (operation) =>
      withStudioReelTempWorkspace(operation, {
        ...(input.config.scratchRoot
          ? { rootPath: input.config.scratchRoot }
          : {}),
      }),
  };
}
