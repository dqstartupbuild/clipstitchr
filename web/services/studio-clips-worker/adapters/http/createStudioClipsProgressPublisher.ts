import type { StudioClipsClaimEnvelope } from "../../contracts/StudioClipsClaimEnvelope";
import type { StudioClipsProgressPublisher } from "../../contracts/StudioClipsProgressPublisher";
import type { StudioClipsWorkerHttpClient } from "./StudioClipsWorkerHttpClient";

export function createStudioClipsProgressPublisher(
  http: StudioClipsWorkerHttpClient,
  claim: StudioClipsClaimEnvelope,
): StudioClipsProgressPublisher {
  return {
    publish: async (event) => {
      await http.post("/api/studio/clips/worker/progress", {
        event,
        leaseId: claim.leaseId,
      });
    },
  };
}
