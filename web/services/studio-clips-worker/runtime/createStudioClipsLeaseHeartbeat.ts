import type { StudioClipsClaimEnvelope } from "../contracts/StudioClipsClaimEnvelope";
import type { StudioClipsWorkerHttpClient } from "../adapters/http/StudioClipsWorkerHttpClient";
import type { StudioClipsLeaseHeartbeat } from "./StudioClipsLeaseHeartbeat";
import { StudioClipsLeaseHeartbeatRunner } from "./StudioClipsLeaseHeartbeatRunner";

export function createStudioClipsLeaseHeartbeat(input: {
  claim: StudioClipsClaimEnvelope;
  http: StudioClipsWorkerHttpClient;
  intervalMs: number;
}): StudioClipsLeaseHeartbeat {
  return new StudioClipsLeaseHeartbeatRunner(input);
}
