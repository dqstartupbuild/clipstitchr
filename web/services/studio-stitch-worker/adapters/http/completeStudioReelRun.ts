import type { StudioReelWorkerClaimEnvelope } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import type { StudioReelWorkerDurableOutput } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerDurableOutput";
import type { StudioReelWorkerHttpClient } from "../../contracts/StudioReelWorkerHttpClient";

export async function completeStudioReelRun(input: {
  claim: StudioReelWorkerClaimEnvelope;
  http: StudioReelWorkerHttpClient;
  outputs: readonly StudioReelWorkerDurableOutput[];
}) {
  return input.http.post("/api/studio/stitch/worker/complete", {
    leaseAttempt: input.claim.leaseAttempt,
    leaseId: input.claim.leaseId,
    outputs: input.outputs,
    ownerId: input.claim.ownerId,
    productId: input.claim.productId,
    runAttempt: input.claim.runAttempt,
    runId: input.claim.runId,
  });
}
