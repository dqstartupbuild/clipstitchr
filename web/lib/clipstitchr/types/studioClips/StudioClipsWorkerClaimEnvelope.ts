import type { StudioClipsWorkerInitialClaim } from "./StudioClipsWorkerInitialClaim";
import type { StudioClipsWorkerRenderRevisionClaim } from "./StudioClipsWorkerRenderRevisionClaim";

export type StudioClipsWorkerClaimEnvelope =
  | StudioClipsWorkerInitialClaim
  | StudioClipsWorkerRenderRevisionClaim;
