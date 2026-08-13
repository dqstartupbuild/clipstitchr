import type { StudioReelWorkerClaimEnvelope } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import type { StudioReelWorkerHttpClient } from "../../contracts/StudioReelWorkerHttpClient";
import type { StudioReelWorkerLeaseState } from "../../contracts/StudioReelWorkerLeaseState";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export async function getStudioReelLeaseState(input: {
  claim: StudioReelWorkerClaimEnvelope;
  http: StudioReelWorkerHttpClient;
}): Promise<StudioReelWorkerLeaseState> {
  const response = (await input.http.post(
    "/api/studio/stitch/worker/lease-state",
    {
      leaseAttempt: input.claim.leaseAttempt,
      leaseId: input.claim.leaseId,
      ownerId: input.claim.ownerId,
      productId: input.claim.productId,
      runAttempt: input.claim.runAttempt,
      runId: input.claim.runId,
    },
  )) as Partial<StudioReelWorkerLeaseState>;
  if (
    typeof response.cancellationRequested !== "boolean" ||
    typeof response.leaseValid !== "boolean" ||
    typeof response.productOwned !== "boolean" ||
    typeof response.runFound !== "boolean" ||
    typeof response.studioAccess !== "boolean" ||
    !response.execution ||
    !["configured", "unavailable"].includes(response.execution.state)
  ) {
    throw new StudioReelWorkerError({
      code: "INVALID_LEASE_RESPONSE",
      kind: "permanent",
      publicMessage: "The Studio Stitch lease response was invalid.",
    });
  }
  return response as StudioReelWorkerLeaseState;
}
