import type { StudioClipsCheckpointStore } from "../contracts/StudioClipsCheckpointStore";
import type { StudioClipsClaimEnvelope } from "../contracts/StudioClipsClaimEnvelope";
import type { StudioClipsPipelineState } from "../contracts/StudioClipsPipelineState";
import type { StudioClipsResumePointer } from "../contracts/StudioClipsResumePointer";
import type { StudioClipsWorkspace } from "../contracts/StudioClipsWorkspace";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";

export async function persistStudioClipsCheckpoint(input: {
  checkpoint: StudioClipsResumePointer["checkpoint"];
  checkpoints: StudioClipsCheckpointStore;
  claim: StudioClipsClaimEnvelope;
  previousRevision: number;
  state: StudioClipsPipelineState;
  workspace: StudioClipsWorkspace;
}): Promise<StudioClipsResumePointer> {
  const saved = await input.checkpoints.save({
    checkpoint: input.checkpoint,
    claim: input.claim,
    state: input.state,
    workspace: input.workspace,
  });

  if (
    !Number.isInteger(saved.revision) ||
    saved.revision <= input.previousRevision ||
    saved.revision > Number.MAX_SAFE_INTEGER
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CHECKPOINT_REVISION",
      kind: "retryable",
      publicMessage: "Studio Clips could not save a safe resume point.",
    });
  }

  return {
    checkpoint: input.checkpoint,
    revision: saved.revision,
  };
}
