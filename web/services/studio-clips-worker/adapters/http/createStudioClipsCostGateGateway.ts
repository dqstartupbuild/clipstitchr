import type { StudioClipsClaimEnvelope } from "../../contracts/StudioClipsClaimEnvelope";
import { getStudioClipsClaimWorkId } from "../../contracts/getStudioClipsClaimWorkId";
import type { StudioClipsCostGateGateway } from "../../contracts/StudioClipsCostGateGateway";
import type { StudioClipsWorkerHttpClient } from "./StudioClipsWorkerHttpClient";

export function createStudioClipsCostGateGateway(
  http: StudioClipsWorkerHttpClient,
  claim: StudioClipsClaimEnvelope,
): StudioClipsCostGateGateway {
  return {
    assertOwnerAndGlobalAllowed: async ({ stage }) => {
      await http.post("/api/studio/clips/worker/cost-reservations", {
        attempt: claim.attempt,
        leaseId: claim.leaseId,
        ownerId: claim.ownerId,
        productId: claim.productId,
        stage,
        taskId: getStudioClipsClaimWorkId(claim),
      });
    },
  };
}
