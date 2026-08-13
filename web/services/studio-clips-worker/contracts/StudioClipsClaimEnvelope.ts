import type { StudioClipsInitialClaimEnvelope } from "./StudioClipsInitialClaimEnvelope";
import type { StudioClipsRenderRevisionClaimEnvelope } from "./StudioClipsRenderRevisionClaimEnvelope";

export type StudioClipsClaimEnvelope =
  | StudioClipsInitialClaimEnvelope
  | StudioClipsRenderRevisionClaimEnvelope;
