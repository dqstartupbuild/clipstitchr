import type { StudioClipsClaimEnvelope } from "../../contracts/StudioClipsClaimEnvelope";
import { getStudioClipsClaimWorkId } from "../../contracts/getStudioClipsClaimWorkId";
import type { StudioClipsProcessResult } from "../../contracts/StudioClipsProcessResult";
import type { StudioClipsWorkerHttpClient } from "./StudioClipsWorkerHttpClient";

export async function failStudioClipsTask(input: {
  claim: StudioClipsClaimEnvelope;
  http: StudioClipsWorkerHttpClient;
  result: Extract<StudioClipsProcessResult, { status: "error" }>;
}): Promise<void> {
  await input.http.post("/api/studio/clips/worker/fail", {
    attempt: input.claim.attempt,
    checkpoint: input.result.checkpoint,
    failure: input.result.failure,
    leaseId: input.claim.leaseId,
    ownerId: input.claim.ownerId,
    productId: input.claim.productId,
    ...(input.result.resume ? { resume: input.result.resume } : {}),
    taskId: getStudioClipsClaimWorkId(input.claim),
  });
}
