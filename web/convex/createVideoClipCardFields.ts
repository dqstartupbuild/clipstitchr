import type { Doc } from "./_generated/dataModel";
import { getVideoClipCardSearchText } from "./getVideoClipCardSearchText";
import { getVideoClipLibraryKind } from "./getVideoClipLibraryKind";

export function createVideoClipCardFields(clip: Doc<"videoClips">) {
  const libraryKind = clip.libraryKind ?? getVideoClipLibraryKind(clip);

  return {
    ownerId: clip.ownerId,
    id: clip.id,
    name: clip.name,
    tags: clip.tags,
    searchText: getVideoClipCardSearchText(clip),
    performanceScore: clip.performanceScore,
    quickEdit: clip.quickEdit,
    productId: clip.productId,
    originalName: clip.originalName,
    clipType: clip.clipType,
    libraryKind,
    videoObject: clip.videoObject,
    posterObject: clip.posterObject,
    posterVersion: clip.posterVersion,
    mimeType: clip.mimeType,
    sourceMimeType: clip.sourceMimeType,
    size: clip.size,
    originalSize: clip.originalSize,
    width: clip.width,
    height: clip.height,
    aspectRatio: clip.aspectRatio,
    duration: clip.duration,
    defaultTrimRange: clip.defaultTrimRange,
    hasAudio: clip.hasAudio,
    swaprMetadata: clip.swaprMetadata,
    cliprMetadata: clip.cliprMetadata,
    isPosted: clip.isPosted,
    postedAt: clip.postedAt,
    automation: clip.automation,
    createdAt: clip.createdAt,
    updatedAt: clip.updatedAt,
  };
}
