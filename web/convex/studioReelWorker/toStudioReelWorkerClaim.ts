import type { Doc } from "../_generated/dataModel";
import type { StudioReelWorkerClaimEnvelope } from "../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import type { StudioReelWorkerClaimRecipe } from "../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimRecipe";

export function toStudioReelWorkerClaim(
  run: Doc<"studioReelGenerationRuns">,
  recipes: readonly StudioReelWorkerClaimRecipe[],
  checkpoint: Doc<"studioReelWorkerCheckpoints"> | null,
): StudioReelWorkerClaimEnvelope {
  if (
    !run.workerLeaseId ||
    !run.workerLeaseAttempt ||
    !run.workerLeaseExpiresAt
  ) {
    throw new Error("Studio Stitch run has no worker lease.");
  }
  return {
    schemaVersion: "studio-stitch-claim-v1",
    ownerId: run.ownerId,
    productId: run.productId,
    runId: run.id,
    runAttempt: run.attempt,
    leaseAttempt: run.workerLeaseAttempt,
    leaseId: run.workerLeaseId,
    leaseExpiresAt: run.workerLeaseExpiresAt,
    requestedAt: run.createdAt,
    recipes,
    ...(checkpoint && checkpoint.checkpoint !== "completed"
      ? {
          resume: {
            checkpoint: checkpoint.checkpoint,
            recipeIndex: checkpoint.recipeIndex,
            revision: checkpoint.revision,
            snapshotJson: checkpoint.snapshotJson,
          },
        }
      : {}),
  };
}
