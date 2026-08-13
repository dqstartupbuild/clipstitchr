import type { Doc } from "../_generated/dataModel";
import type { StudioClipsOutput } from "../../lib/clipstitchr/types/studioClips/StudioClipsOutput";
import { parseStudioClipsOutputEditState } from "./parseStudioClipsOutputEditState";

export function toStudioClipsOutput(
  output: Doc<"studioClipsOutputs">,
): StudioClipsOutput {
  return {
    artifactId: output.artifactId,
    ...(output.audioCodec ? { audioCodec: output.audioCodec } : {}),
    contentType: output.contentType,
    createdAt: output.createdAt,
    ...(output.durationSeconds !== undefined
      ? { durationSeconds: output.durationSeconds }
      : {}),
    edit: parseStudioClipsOutputEditState(
      output.editSnapshotVersion,
      output.editSnapshotJson,
    ),
    id: output.id,
    ...(output.fileName ? { fileName: output.fileName } : {}),
    ...(output.hasAudio === undefined ? {} : { hasAudio: output.hasAudio }),
    ...(output.height === undefined ? {} : { height: output.height }),
    ...(output.libraryClipId ? { libraryClipId: output.libraryClipId } : {}),
    objectKey: output.objectKey,
    ...(output.parentOutputId ? { parentOutputId: output.parentOutputId } : {}),
    ...(output.platformPreset ? { platformPreset: output.platformPreset } : {}),
    productId: output.productId,
    revision: output.revision,
    ...(output.renderRevisionId ? { renderRevisionId: output.renderRevisionId } : {}),
    sha256: output.sha256,
    sizeBytes: output.sizeBytes,
    taskId: output.taskId,
    updatedAt: output.updatedAt,
    ...(output.videoCodec ? { videoCodec: output.videoCodec } : {}),
    ...(output.width === undefined ? {} : { width: output.width }),
  };
}
