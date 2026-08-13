import type { Doc } from "../_generated/dataModel";
import type { StudioClipsImmutableSourceOutput } from "../../lib/clipstitchr/types/studioClips/StudioClipsImmutableSourceOutput";
import { assertStudioClipsSourceOutputIsImmutable } from "./assertStudioClipsSourceOutputIsImmutable";

export function toStudioClipsImmutableSourceOutput(
  output: Doc<"studioClipsOutputs">,
): StudioClipsImmutableSourceOutput {
  assertStudioClipsSourceOutputIsImmutable(output, output.revision);
  let captionCues:
    | import("../../lib/clipstitchr/types/studioClips/StudioClipsCaptionCue").StudioClipsCaptionCue[]
    | undefined;
  if (output.captionCuesJson) {
    try {
      captionCues = JSON.parse(output.captionCuesJson) as typeof captionCues;
    } catch {
      throw new Error("Studio Clips output caption snapshot is invalid.");
    }
  }
  return {
    ...(output.audioCodec ? { audioCodec: output.audioCodec } : {}),
    ...(captionCues ? { captionCues } : {}),
    ...(output.captionsBurned === undefined
      ? {}
      : { captionsBurned: output.captionsBurned }),
    contentType: output.contentType,
    ...(output.cleanMasterContentType &&
    output.cleanMasterObjectKey &&
    output.cleanMasterSha256 &&
    output.cleanMasterSizeBytes
      ? {
          cleanMaster: {
            contentType: output.cleanMasterContentType,
            objectKey: output.cleanMasterObjectKey,
            sha256: output.cleanMasterSha256,
            sizeBytes: output.cleanMasterSizeBytes,
          },
        }
      : {}),
    durationSeconds: output.durationSeconds!,
    fileName: output.fileName!,
    hasAudio: output.hasAudio!,
    height: output.height!,
    id: output.id,
    objectKey: output.objectKey,
    revision: output.revision,
    sha256: output.sha256,
    sizeBytes: output.sizeBytes,
    taskId: output.taskId,
    videoCodec: output.videoCodec!,
    width: output.width!,
  };
}
