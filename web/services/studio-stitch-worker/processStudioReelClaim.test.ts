import { describe, expect, it, vi } from "vitest";
import { createStudioStitchTestClassicInput } from "../../lib/clipstitchr/studio/stitch/test/createStudioStitchTestClassicInput";
import { planClassicStudioStitchRecipe } from "../../lib/clipstitchr/studio/stitch/planClassicStudioStitchRecipe";
import type { StudioReelClaimProcessorDependencies } from "./contracts/StudioReelClaimProcessorDependencies";
import type { StudioReelWorkerWorkspace } from "./contracts/StudioReelWorkerWorkspace";
import { processStudioReelClaim } from "./processStudioReelClaim";

describe("processStudioReelClaim", () => {
  it("checkpoints deterministic DanSUGC selection before paid acquisition", async () => {
    const planned = planClassicStudioStitchRecipe(
      createStudioStitchTestClassicInput(),
    );
    const recipe = {
      ...planned,
      providerRequirements: planned.providerRequirements.map((requirement) =>
        requirement.capability === "reactionFootage"
          ? {
              ...requirement,
              blocking: false,
              providerId: "dansugc",
              satisfiedByInput: false,
              state: "available" as const,
            }
          : requirement,
      ),
    };
    const reactionSource = recipe.segments[0].source;
    const selection = {
      modelId: "model_1",
      price: 3,
      recipeId: recipe.id,
      source: reactionSource,
      title: "Reaction",
      videoId: "video_1",
    };
    const reactionManifest = {
      contentType: "video/mp4" as const,
      durationSeconds: 8,
      hasAudio: false,
      height: 1920,
      objectKey: "users/user_1/studio/reaction.mp4",
      objectVersion: "version-12345678",
      sha256: "b".repeat(64),
      sizeBytes: 50,
      source: reactionSource,
      width: 1080,
    };
    const checkpoints: Array<{ checkpoint: string; snapshot: unknown }> = [];
    const selectReactionSources = vi.fn(async () => [selection]);
    const acquireReactionAssets = vi.fn(async () => ({
      assets: [{ localPath: "/tmp/reaction.mp4", manifest: reactionManifest }],
      checkpointAssets: [
        {
          ...reactionManifest,
          currency: "USD",
          modelId: "model_1",
          pricePaid: 3,
          purchasedAt: "2026-08-12T00:00:00.000Z",
          recipeId: recipe.id,
          videoId: "video_1",
        },
      ],
    }));
    const dependencies = {
      acquireAssets: vi.fn(async () => []),
      acquireReactionAssets,
      analyzeDemo: vi.fn(),
      assertActive: vi.fn(async () => undefined),
      checkpoint: vi.fn(async (input) => {
        checkpoints.push(input);
        return checkpoints.length;
      }),
      createVoice: vi.fn(),
      probeOutput: vi.fn(async () => ({
        audioCodec: "aac",
        durationSeconds: recipe.durationSeconds,
        hasAudio: true,
        height: recipe.canvas.heightPixels,
        sizeBytes: 100,
        videoCodec: "h264",
        width: recipe.canvas.widthPixels,
      })),
      progress: vi.fn(async () => undefined),
      render: vi.fn(async () => "/tmp/output.mp4"),
      reserve: vi.fn(async () => undefined),
      restoreReactionAssets: vi.fn(),
      restoreVoice: vi.fn(),
      selectReactionSources,
      storeOutput: vi.fn(async () => ({
        objectKey: "users/user_1/studio/output.mp4",
        objectVersion: "version-12345678",
        sha256: "a".repeat(64),
        sizeBytes: 100,
      })),
      storeVoice: vi.fn(),
      withWorkspace: async (
        operation: (
          workspace: StudioReelWorkerWorkspace,
        ) => Promise<unknown>,
      ) =>
        await operation({
          assertWithinBudget: vi.fn(async () => undefined),
          maxBytes: 1024,
          path: "/tmp",
        }),
    } as unknown as StudioReelClaimProcessorDependencies;

    await expect(
      processStudioReelClaim(
        {
          schemaVersion: "studio-stitch-claim-v1",
          leaseAttempt: 1,
          leaseExpiresAt: "2026-08-12T01:00:00.000Z",
          leaseId: "lease_1",
          ownerId: "user_1",
          productId: recipe.productId,
          recipes: [
            {
              assets: [],
              id: recipe.id,
              pipeline: recipe.pipeline,
              recipeJson: JSON.stringify(recipe),
            },
          ],
          requestedAt: "2026-08-12T00:00:00.000Z",
          runAttempt: 1,
          runId: "run_1",
        },
        dependencies,
      ),
    ).resolves.toHaveLength(1);
    expect(selectReactionSources).toHaveBeenCalledOnce();
    expect(acquireReactionAssets).toHaveBeenCalledWith(
      expect.objectContaining({ id: recipe.id }),
      [selection],
      expect.objectContaining({ path: "/tmp" }),
    );
    expect(checkpoints[0]).toMatchObject({
      checkpoint: "claim_validated",
      snapshot: { reactionSelections: [selection] },
    });
    expect(checkpoints[1]).toMatchObject({
      checkpoint: "sources_acquired",
      snapshot: {
        reactionAssets: [expect.objectContaining({ videoId: "video_1" })],
      },
    });
  });

  it("recovers a checkpointed durable output without repeating side effects", async () => {
    const recipe = planClassicStudioStitchRecipe(
      createStudioStitchTestClassicInput(),
    );
    const output = {
      contentType: "video/mp4" as const,
      durationSeconds: recipe.durationSeconds,
      hasAudio: false,
      height: recipe.canvas.heightPixels,
      objectKey: "users/user_1/studio/output.mp4",
      objectVersion: "version-12345678",
      recipeId: recipe.id,
      sha256: "a".repeat(64),
      sizeBytes: 100,
      videoCodec: "h264",
      width: recipe.canvas.widthPixels,
    };
    const withWorkspace = vi.fn();
    const claim = {
      leaseAttempt: 1,
      leaseExpiresAt: "2026-08-12T01:00:00.000Z",
      leaseId: "lease_1",
      ownerId: "user_1",
      productId: recipe.productId,
      recipes: [
        {
          assets: [],
          id: recipe.id,
          pipeline: recipe.pipeline,
          recipeJson: JSON.stringify(recipe),
        },
      ],
      requestedAt: "2026-08-12T00:00:00.000Z",
      resume: {
        checkpoint: "output_stored" as const,
        recipeIndex: 0,
        revision: 4,
        snapshotJson: JSON.stringify({
          analyses: [],
          outputs: [output],
          reactionAssets: [],
          reactionSelections: [],
          schemaVersion: "studio-stitch-execution-v1",
          voices: [],
        }),
      },
      runAttempt: 1,
      runId: "run_1",
      schemaVersion: "studio-stitch-claim-v1" as const,
    };

    await expect(
      processStudioReelClaim(claim, {
        withWorkspace,
      } as unknown as StudioReelClaimProcessorDependencies),
    ).resolves.toEqual([output]);
    expect(withWorkspace).not.toHaveBeenCalled();
  });
});
