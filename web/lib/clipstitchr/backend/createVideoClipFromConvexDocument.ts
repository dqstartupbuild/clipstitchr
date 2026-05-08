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
    originalName: clip.originalName,
    clipType: clip.clipType,
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
    createdAt: clip.createdAt,
    updatedAt: clip.updatedAt,
  };
}
