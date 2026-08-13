import type { StudioClipsCancellationGateway } from "../../contracts/StudioClipsCancellationGateway";
import type { StudioClipsClaimEnvelope } from "../../contracts/StudioClipsClaimEnvelope";
import type { StudioClipsWorkerHttpClient } from "./StudioClipsWorkerHttpClient";
import { readStudioClipsLeaseState } from "./readStudioClipsLeaseState";

export function createStudioClipsCancellationGateway(
  http: StudioClipsWorkerHttpClient,
  claim: StudioClipsClaimEnvelope,
): StudioClipsCancellationGateway {
  return {
    getIsCancellationRequested: async () => {
      const state = await readStudioClipsLeaseState(http, claim);
      return state.cancellationRequested || state.status === "cancelled";
    },
  };
}
