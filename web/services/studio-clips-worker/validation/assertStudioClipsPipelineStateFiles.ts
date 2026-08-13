import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import type { StudioClipsPipelineState } from "../contracts/StudioClipsPipelineState";
import { assertStudioClipsLocalFileSize } from "../workspace/assertStudioClipsLocalFileSize";

export async function assertStudioClipsPipelineStateFiles(
  state: StudioClipsPipelineState,
): Promise<void> {
  if (state.source) {
    await assertStudioClipsLocalFileSize(
      state.source.localPath,
      state.source.sizeBytes,
      STUDIO_CLIPS_LIMITS.inputSizeBytes,
    );
  }

  for (const artifact of state.sources ?? []) {
    await assertStudioClipsLocalFileSize(
      artifact.localPath,
      artifact.sizeBytes,
      STUDIO_CLIPS_LIMITS.outputSizeBytes,
    );
  }

  for (const artifact of state.broll ?? []) {
    await assertStudioClipsLocalFileSize(
      artifact.localPath,
      artifact.sizeBytes,
      STUDIO_CLIPS_LIMITS.brollArtifactSizeBytes,
    );
  }

  for (const artifact of state.renders ?? []) {
    await assertStudioClipsLocalFileSize(
      artifact.localPath,
      artifact.sizeBytes,
      STUDIO_CLIPS_LIMITS.outputSizeBytes,
    );
    if (artifact.cleanMaster) {
      await assertStudioClipsLocalFileSize(
        artifact.cleanMaster.localPath,
        artifact.cleanMaster.sizeBytes,
        STUDIO_CLIPS_LIMITS.outputSizeBytes,
      );
    }
  }
}
