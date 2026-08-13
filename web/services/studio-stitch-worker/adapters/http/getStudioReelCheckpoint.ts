import type { StudioReelWorkerClaimEnvelope } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import type { StudioReelWorkerCheckpointRecord } from "../../contracts/StudioReelWorkerCheckpointRecord";
import type { StudioReelWorkerHttpClient } from "../../contracts/StudioReelWorkerHttpClient";

export async function getStudioReelCheckpoint(input: {
  claim: StudioReelWorkerClaimEnvelope;
  http: StudioReelWorkerHttpClient;
  revision: number;
}): Promise<StudioReelWorkerCheckpointRecord> {
  return (await input.http.post("/api/studio/stitch/worker/checkpoints/get", {
    leaseAttempt: input.claim.leaseAttempt,
    leaseId: input.claim.leaseId,
    ownerId: input.claim.ownerId,
    productId: input.claim.productId,
    revision: input.revision,
    runAttempt: input.claim.runAttempt,
    runId: input.claim.runId,
  })) as StudioReelWorkerCheckpointRecord;
}
