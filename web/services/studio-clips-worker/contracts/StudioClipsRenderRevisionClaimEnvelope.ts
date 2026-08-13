import type { StudioClipsImmutableSourceOutput } from "../../../lib/clipstitchr/types/studioClips/StudioClipsImmutableSourceOutput";
import type { StudioClipsRenderOperation } from "../../../lib/clipstitchr/types/studioClips/StudioClipsRenderOperation";
import type { STUDIO_CLIPS_CLAIM_SCHEMA_VERSION } from "../constants/studioClipsContractVersion";
import type { StudioClipsResumePointer } from "./StudioClipsResumePointer";

export type StudioClipsRenderRevisionClaimEnvelope = {
  attempt: number;
  leaseId: string;
  mode: "render_revision";
  operation: StudioClipsRenderOperation;
  ownerId: string;
  productId: string;
  renderRevisionId: string;
  requestedAt: string;
  resume?: StudioClipsResumePointer;
  schemaVersion: typeof STUDIO_CLIPS_CLAIM_SCHEMA_VERSION;
  sourceOutput: StudioClipsImmutableSourceOutput;
  sourceOutputs: StudioClipsImmutableSourceOutput[];
  taskId: string;
};
