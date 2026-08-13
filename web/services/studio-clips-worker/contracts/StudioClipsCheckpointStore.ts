import type { StudioClipsCheckpoint } from "./StudioClipsCheckpoint";
import type { StudioClipsClaimEnvelope } from "./StudioClipsClaimEnvelope";
import type { StudioClipsPipelineState } from "./StudioClipsPipelineState";
import type { StudioClipsResumePointer } from "./StudioClipsResumePointer";
import type { StudioClipsWorkspace } from "./StudioClipsWorkspace";

export type StudioClipsCheckpointStore = {
  restore: (input: {
    claim: StudioClipsClaimEnvelope;
    resume: StudioClipsResumePointer;
    workspace: StudioClipsWorkspace;
  }) => Promise<StudioClipsPipelineState>;
  save: (input: {
    checkpoint: Exclude<StudioClipsCheckpoint, "claim_validated" | "completed">;
    claim: StudioClipsClaimEnvelope;
    state: StudioClipsPipelineState;
    workspace: StudioClipsWorkspace;
  }) => Promise<{ revision: number }>;
};
