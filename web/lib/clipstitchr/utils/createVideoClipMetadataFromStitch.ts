import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function createVideoClipMetadataFromStitch(
  stitch: Stitch,
): VideoClipMetadata {
  return {
    id: stitch.id,
    name: stitch.name,
    tags: ["stitch"],
    videoDescription: `Finished stitch using ${stitch.ugcClipName} and ${stitch.demoClipName}.`,
    originalName: `${stitch.name}.mp4`,
    clipType: "ugc",
    videoObject: stitch.stitchObject,
    posterObject: stitch.posterObject,
    posterBlob: stitch.posterBlob,
    posterVersion: stitch.posterVersion,
    mimeType: stitch.mimeType,
    sourceMimeType: stitch.mimeType,
    size: stitch.size,
    originalSize: stitch.size,
    width: stitch.width,
    height: stitch.height,
    aspectRatio: stitch.height > 0 ? stitch.width / stitch.height : 0,
    duration: stitch.duration,
    defaultTrimRange: {
      start: 0,
      end: stitch.duration,
    },
    hasAudio: true,
    createdAt: stitch.createdAt,
    updatedAt: stitch.createdAt,
  };
}
