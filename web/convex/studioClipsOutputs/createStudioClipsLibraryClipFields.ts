import type { Doc } from "../_generated/dataModel";
import { getVideoClipLibraryKind } from "../getVideoClipLibraryKind";
import { parseStudioClipsOutputEditState } from "./parseStudioClipsOutputEditState";

export function createStudioClipsLibraryClipFields(
  output: Doc<"studioClipsOutputs">,
  input: {
    libraryClipId: string;
    now: string;
    ownerId: string;
    productId: string;
  },
) {
  if (
    output.contentType !== "video/mp4" ||
    output.durationSeconds === undefined ||
    output.hasAudio === undefined ||
    output.height === undefined ||
    output.width === undefined
  ) {
    throw new Error("This Studio clip is missing verified MP4 metadata.");
  }

  const edit = parseStudioClipsOutputEditState(
    output.editSnapshotVersion,
    output.editSnapshotJson,
  );
  if (edit.acceptance.state !== "accepted") {
    throw new Error("Accept this Studio clip before saving it to the Library.");
  }

  const safeArtifactName = output.artifactId.replace(/[_-]+/gu, " ").trim();
  const name = `${safeArtifactName || "Selected clip"} - Studio Clips`.slice(
    0,
    200,
  );
  const originalName = (output.fileName || `${output.artifactId}.mp4`).slice(
    0,
    240,
  );
  const clipType = "ugc" as const;
  const defaultTrimRange = edit.trim
    ? { start: edit.trim.startSeconds, end: edit.trim.endSeconds }
    : { start: 0, end: output.durationSeconds };

  return {
    aspectRatio: output.width / output.height,
    clipType,
    createdAt: input.now,
    defaultTrimRange,
    duration: output.durationSeconds,
    hasAudio: output.hasAudio,
    height: output.height,
    id: input.libraryClipId,
    libraryKind: getVideoClipLibraryKind({ clipType }),
    mimeType: output.contentType,
    name,
    originalName,
    originalSize: output.sizeBytes,
    ownerId: input.ownerId,
    productId: input.productId,
    size: output.sizeBytes,
    sourceMimeType: output.contentType,
    tags: ["ugc", "studio-clips"],
    updatedAt: input.now,
    videoDescription: "A finished clip saved from Studio Clips.",
    videoObject: {
      contentType: output.contentType,
      key: output.objectKey,
      size: output.sizeBytes,
    },
    width: output.width,
  };
}
