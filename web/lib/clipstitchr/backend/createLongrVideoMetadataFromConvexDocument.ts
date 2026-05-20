import type { Doc } from "@/convex/_generated/dataModel";
import type { LongrVideoMetadata } from "@/lib/clipstitchr/types/LongrVideoMetadata";

export function createLongrVideoMetadataFromConvexDocument(
  longrVideo: Doc<"longrVideos">,
  posterBlob?: Blob,
): LongrVideoMetadata {
  return {
    id: longrVideo.id,
    name: longrVideo.name,
    clipSegments: longrVideo.clipSegments,
    musicClips: longrVideo.musicClips,
    longrObject: longrVideo.longrObject,
    posterObject: longrVideo.posterObject,
    posterBlob,
    posterVersion: longrVideo.posterVersion,
    mimeType: longrVideo.mimeType,
    size: longrVideo.size,
    width: longrVideo.width,
    height: longrVideo.height,
    duration: longrVideo.duration,
    createdAt: longrVideo.createdAt,
  };
}
