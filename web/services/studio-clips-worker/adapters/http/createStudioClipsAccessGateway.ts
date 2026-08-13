import type { StudioClipsAccessGateway } from "../../contracts/StudioClipsAccessGateway";
import type { StudioClipsClaimEnvelope } from "../../contracts/StudioClipsClaimEnvelope";
import { rejectStudioClipsAccess } from "./rejectStudioClipsAccess";
import type { StudioClipsWorkerHttpClient } from "./StudioClipsWorkerHttpClient";
import { readStudioClipsLeaseState } from "./readStudioClipsLeaseState";

export function createStudioClipsAccessGateway(
  http: StudioClipsWorkerHttpClient,
  claim: StudioClipsClaimEnvelope,
): StudioClipsAccessGateway {
  return {
    assertClaimLease: async () => {
      const state = await readStudioClipsLeaseState(http, claim);
      if (!state.taskFound || !state.leaseValid) {
        rejectStudioClipsAccess("CLAIM_LEASE_INVALID", "The Studio Clips task lease is no longer valid.");
      }
    },
    assertProductOwnership: async () => {
      const state = await readStudioClipsLeaseState(http, claim);
      if (!state.taskFound || !state.productOwned) {
        rejectStudioClipsAccess(
          "PRODUCT_OWNERSHIP_REVOKED",
          "This Product is no longer available to the Studio owner.",
        );
      }
    },
    assertStudioAccess: async () => {
      const state = await readStudioClipsLeaseState(http, claim);
      if (!state.taskFound || !state.studioAccess) {
        rejectStudioClipsAccess("STUDIO_ACCESS_REVOKED", "Studio access is no longer available.");
      }
    },
  };
}
