import type { StudioReelWorkerCheckpoint } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerCheckpoint";
import type { StudioReelWorkerClaimEnvelope } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import type { StudioReelWorkerHttpClient } from "../../contracts/StudioReelWorkerHttpClient";

export async function saveStudioReelCheckpoint(input: {
  checkpoint: Exclude<StudioReelWorkerCheckpoint, "completed">;
  claim: StudioReelWorkerClaimEnvelope;
  expectedRevision: number;
  http: StudioReelWorkerHttpClient;
  recipeIndex: number;
  snapshotJson: string;
}): Promise<{ checkpoint: string; revision: number }> {
  return (await input.http.post(
    "/api/studio/stitch/worker/checkpoints/save",
    {
      checkpoint: input.checkpoint,
      expectedRevision: input.expectedRevision,
      leaseAttempt: input.claim.leaseAttempt,
      leaseId: input.claim.leaseId,
      ownerId: input.claim.ownerId,
      productId: input.claim.productId,
      recipeIndex: input.recipeIndex,
      runAttempt: input.claim.runAttempt,
      runId: input.claim.runId,
      snapshotJson: input.snapshotJson,
    },
  )) as { checkpoint: string; revision: number };
}
