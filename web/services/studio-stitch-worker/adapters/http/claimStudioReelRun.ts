import type { StudioReelWorkerAvailability } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerAvailability";
import type { StudioReelWorkerClaimEnvelope } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import type { StudioReelWorkerHttpClient } from "../../contracts/StudioReelWorkerHttpClient";
import { readStudioReelWorkerClaimEnvelope } from "../../validation/readStudioReelWorkerClaimEnvelope";

export async function claimStudioReelRun(input: {
  http: StudioReelWorkerHttpClient;
  leaseSeconds: number;
  workerId: string;
}): Promise<{
  availability: StudioReelWorkerAvailability;
  claim: StudioReelWorkerClaimEnvelope | null;
}> {
  const response = await input.http.post("/api/studio/stitch/worker/claim", {
    leaseSeconds: input.leaseSeconds,
    workerId: input.workerId,
  });
  const value = response as {
    availability?: StudioReelWorkerAvailability;
    claim?: unknown;
  };
  if (
    !value.availability ||
    !["configured", "unavailable"].includes(value.availability.state) ||
    (value.claim !== null && value.claim === undefined)
  ) {
    throw new Error("The Studio Stitch claim response is invalid.");
  }
  return {
    availability: value.availability,
    claim: value.claim === null ? null : readStudioReelWorkerClaimEnvelope(value.claim),
  };
}
