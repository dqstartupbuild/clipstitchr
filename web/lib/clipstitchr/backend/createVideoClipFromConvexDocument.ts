import type { Doc } from "@/convex/_generated/dataModel";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

type CreateVideoClipFromConvexDocumentOptions = {
  clip: Doc<"videoClips">;
  blob: Blob;
  posterBlob?: Blob;
};

export function createVideoClipFromConvexDocument({
  clip,
  blob,
  posterBlob,
}: CreateVideoClipFromConvexDocumentOptions): VideoClip {
  return {
    id: clip.id,
    name: clip.name,
    tags: clip.tags,
    videoDescription: clip.videoDescription,
    mainPersonDescription: clip.mainPersonDescription,
    outfitDescription: clip.outfitDescription,
    locationDescription: clip.locationDescription,
    poseDescription: clip.poseDescription,
    productDescription: clip.productDescription,
    productId: clip.productId,
    originalName: clip.originalName,
    clipType: clip.clipType,
    libraryKind: clip.libraryKind,
    videoObject: clip.videoObject,
    blob,
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
