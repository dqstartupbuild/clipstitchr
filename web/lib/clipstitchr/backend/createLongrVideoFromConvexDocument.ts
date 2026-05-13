import type { Doc } from "@/convex/_generated/dataModel";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";

type CreateLongrVideoFromConvexDocumentOptions = {
  longrVideo: Doc<"longrVideos">;
  blob: Blob;
  posterBlob?: Blob;
};

export function createLongrVideoFromConvexDocument({
  longrVideo,
  blob,
  posterBlob,
}: CreateLongrVideoFromConvexDocumentOptions): LongrVideo {
  return {
    id: longrVideo.id,
    name: longrVideo.name,
    clipSegments: longrVideo.clipSegments,
    musicClips: longrVideo.musicClips,
    longrObject: longrVideo.longrObject,
    blob,
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
