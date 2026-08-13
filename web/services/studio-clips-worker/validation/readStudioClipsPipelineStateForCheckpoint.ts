import type { StudioClipsCheckpoint } from "../contracts/StudioClipsCheckpoint";
import type { StudioClipsClaimEnvelope } from "../contracts/StudioClipsClaimEnvelope";
import type { StudioClipsPipelineState } from "../contracts/StudioClipsPipelineState";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsAnalysisArtifact } from "./assertStudioClipsAnalysisArtifact";
import { assertStudioClipsBrollArtifacts } from "./assertStudioClipsBrollArtifacts";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { assertStudioClipsMediaProbe } from "./assertStudioClipsMediaProbe";
import { assertStudioClipsRenderArtifacts } from "./assertStudioClipsRenderArtifacts";
import { assertStudioClipsRestoredOutputs } from "./assertStudioClipsRestoredOutputs";
import { assertStudioClipsSourceArtifact } from "./assertStudioClipsSourceArtifact";
import { assertStudioClipsTranscriptArtifact } from "./assertStudioClipsTranscriptArtifact";
import { getStudioClipsValueIsRecord } from "./getStudioClipsValueIsRecord";
import { assertStudioClipsRevisionSourceArtifacts } from "./assertStudioClipsRevisionSourceArtifacts";
import { getStudioClipsCheckpointNeedsStateThrough } from "./getStudioClipsCheckpointNeedsStateThrough";

export function readStudioClipsPipelineStateForCheckpoint(input: {
  checkpoint: StudioClipsCheckpoint;
  claim: StudioClipsClaimEnvelope;
  state: unknown;
  workspacePath: string;
}): StudioClipsPipelineState {
  if (!getStudioClipsValueIsRecord(input.state)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_RESUME_STATE",
      kind: "permanent",
      publicMessage: "The saved Studio Clips resume state is invalid.",
    });
  }

  assertStudioClipsExactKeys(
    input.state,
    [
      "analysis",
      "broll",
      "media",
      "mediaList",
      "outputs",
      "renders",
      "source",
      "sources",
      "transcript",
    ],
    "Resume state",
  );
  if (input.claim.mode === "render_revision") {
    if (input.checkpoint === "source_acquired") {
      assertStudioClipsRevisionSourceArtifacts(
        input.state.sources,
        input.workspacePath,
      );
    }
    if (input.checkpoint === "media_validated") {
      assertStudioClipsRevisionSourceArtifacts(
        input.state.sources,
        input.workspacePath,
      );
      if (
        !Array.isArray(input.state.mediaList) ||
        input.state.mediaList.length !== input.claim.sourceOutputs.length
      ) {
        throw new StudioClipsWorkerError({
          code: "INVALID_REVISION_MEDIA_STATE",
          kind: "permanent",
          publicMessage: "The saved revision media state is invalid.",
        });
      }
      for (const media of input.state.mediaList) {
        assertStudioClipsMediaProbe(media, { requireAudio: false });
      }
    }
    if (input.checkpoint === "rendered") {
      assertStudioClipsRenderArtifacts(
        input.state.renders,
        input.workspacePath,
      );
    }
    if (input.checkpoint === "output_stored") {
      assertStudioClipsRestoredOutputs(input.state.outputs, {
        ownerId: input.claim.ownerId,
        productId: input.claim.productId,
        taskId: input.claim.renderRevisionId,
      });
    }
    return input.state as StudioClipsPipelineState;
  }

  if (
    getStudioClipsCheckpointNeedsStateThrough({
      checkpoint: input.checkpoint,
      finalCheckpoint: "b_roll_ready",
      requiredCheckpoint: "source_acquired",
    })
  ) {
    assertStudioClipsSourceArtifact(input.state.source, input.workspacePath);
  }
  if (
    getStudioClipsCheckpointNeedsStateThrough({
      checkpoint: input.checkpoint,
      finalCheckpoint: "b_roll_ready",
      requiredCheckpoint: "media_validated",
    })
  ) {
    assertStudioClipsMediaProbe(input.state.media);
  }
  if (
    getStudioClipsCheckpointNeedsStateThrough({
      checkpoint: input.checkpoint,
      finalCheckpoint: "b_roll_ready",
      requiredCheckpoint: "transcribed",
    })
  ) {
    assertStudioClipsTranscriptArtifact(input.state.transcript);
  }
  if (
    getStudioClipsCheckpointNeedsStateThrough({
      checkpoint: input.checkpoint,
      finalCheckpoint: "b_roll_ready",
      requiredCheckpoint: "analyzed",
    })
  ) {
    assertStudioClipsAnalysisArtifact(input.state.analysis);
  }
  if (input.checkpoint === "b_roll_ready") {
    assertStudioClipsBrollArtifacts(input.state.broll, input.workspacePath);
  }
  if (input.checkpoint === "rendered") {
    assertStudioClipsRenderArtifacts(input.state.renders, input.workspacePath);
  }
  if (input.checkpoint === "output_stored") {
    assertStudioClipsRestoredOutputs(input.state.outputs, {
      ownerId: input.claim.ownerId,
      productId: input.claim.productId,
      taskId: input.claim.taskId,
    });
  }

  return input.state as StudioClipsPipelineState;
}
