import type { Doc } from "@/convex/_generated/dataModel";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function createVideoClipMetadataFromConvexDocument(
  clip: Doc<"videoClips"> | Doc<"videoClipCards">,
  posterBlob?: Blob,
): VideoClipMetadata {
  return {
    id: clip.id,
    name: clip.name,
    tags: clip.tags,
    searchText: "searchText" in clip ? clip.searchText : undefined,
    videoDescription:
      "videoDescription" in clip ? clip.videoDescription : undefined,
    mainPersonDescription:
      "mainPersonDescription" in clip ? clip.mainPersonDescription : undefined,
    outfitDescription:
      "outfitDescription" in clip ? clip.outfitDescription : undefined,
    locationDescription:
      "locationDescription" in clip ? clip.locationDescription : undefined,
    poseDescription:
      "poseDescription" in clip ? clip.poseDescription : undefined,
    performanceScore: clip.performanceScore,
    quickEdit: clip.quickEdit,
    productDescription:
      "productDescription" in clip ? clip.productDescription : undefined,
    productId: clip.productId,
    originalName: clip.originalName,
    clipType: clip.clipType,
    libraryKind: clip.libraryKind,
    videoObject: clip.videoObject,
    posterObject: clip.posterObject,
    posterBlob,
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
    createdAt: clip.createdAt,
    updatedAt: clip.updatedAt,
  };
}
