import type { StudioClipsImmutableSourceOutput } from "./StudioClipsImmutableSourceOutput";
import type { StudioClipsRenderOperation } from "./StudioClipsRenderOperation";
import type { StudioClipsResumePointer } from "./StudioClipsResumePointer";

export type StudioClipsWorkerRenderRevisionClaim = {
  attempt: number;
  leaseId: string;
  mode: "render_revision";
  operation: StudioClipsRenderOperation;
  ownerId: string;
  productId: string;
  renderRevisionId: string;
  requestedAt: string;
  resume?: StudioClipsResumePointer;
  schemaVersion: "studio-clips-claim-v2";
  sourceOutput: StudioClipsImmutableSourceOutput;
  sourceOutputs: StudioClipsImmutableSourceOutput[];
  taskId: string;
};
