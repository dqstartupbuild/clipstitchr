import type { Doc } from "../_generated/dataModel";
import { getVideoClipLibraryKind } from "../getVideoClipLibraryKind";

export function createStudioReelLibraryClipFields(
  output: Doc<"studioReelOutputs">,
  input: {
    readonly libraryClipId: string;
    readonly now: string;
    readonly ownerId: string;
    readonly productId: string;
  },
) {
  if (
    output.contentType !== "video/mp4" ||
    !output.sha256 ||
    !output.objectVersion ||
    output.width === undefined ||
    output.height === undefined ||
    output.hasAudio === undefined ||
    output.width < 1 ||
    output.height < 1 ||
    output.durationSeconds <= 0 ||
    output.byteLength < 1
  ) {
    throw new Error("This Studio Stitch output is missing verified MP4 metadata.");
  }

  const clipType = "ugc" as const;
  const recipeName = output.recipeId.replace(/[_-]+/gu, " ").trim();
  const name = `${recipeName || "Finished video"} - Studio Stitch`.slice(0, 200);

  return {
    aspectRatio: output.width / output.height,
    clipType,
    createdAt: input.now,
    defaultTrimRange: { start: 0, end: output.durationSeconds },
    duration: output.durationSeconds,
    hasAudio: output.hasAudio,
    height: output.height,
    id: input.libraryClipId,
    libraryKind: getVideoClipLibraryKind({ clipType }),
    mimeType: output.contentType,
    name,
    originalName: `${output.id}.mp4`.slice(0, 240),
    originalSize: output.byteLength,
    ownerId: input.ownerId,
    productId: input.productId,
    size: output.byteLength,
    sourceMimeType: output.contentType,
    tags: ["ugc", "studio-stitch"],
    updatedAt: input.now,
    videoDescription: "A finished video saved from Studio Stitch.",
    videoObject: {
      contentType: output.contentType,
      key: output.objectKey,
      size: output.byteLength,
    },
    width: output.width,
  };
}
