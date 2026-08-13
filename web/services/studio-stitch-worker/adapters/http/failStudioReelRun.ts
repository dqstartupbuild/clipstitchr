import type { StudioReelWorkerCheckpoint } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerCheckpoint";
import type { StudioReelWorkerClaimEnvelope } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import type { StudioReelWorkerFailure } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerFailure";
import type { StudioReelWorkerHttpClient } from "../../contracts/StudioReelWorkerHttpClient";

export async function failStudioReelRun(input: {
  checkpoint: StudioReelWorkerCheckpoint;
  claim: StudioReelWorkerClaimEnvelope;
  failure: StudioReelWorkerFailure;
  http: StudioReelWorkerHttpClient;
  recipeIndex: number;
}) {
  return input.http.post("/api/studio/stitch/worker/fail", {
    checkpoint: input.checkpoint,
    failure: input.failure,
    leaseAttempt: input.claim.leaseAttempt,
    leaseId: input.claim.leaseId,
    ownerId: input.claim.ownerId,
    productId: input.claim.productId,
    recipeIndex: input.recipeIndex,
    runAttempt: input.claim.runAttempt,
    runId: input.claim.runId,
  });
}
