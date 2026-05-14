import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function createVideoClipMetadataFromStitch(
  stitch: Stitch,
): VideoClipMetadata {
  const mimeType = stitch.mimeType ?? "video/mp4";
  const size = stitch.size ?? 0;
  const videoObject = stitch.stitchObject ?? {
    contentType: mimeType,
    key: `stitches/${stitch.id}/render-on-export`,
    size,
  };
  const hasSourceAudio =
    stitch.includeUgcAudio !== false || stitch.includeDemoAudio !== false;

  return {
    id: stitch.id,
    name: stitch.name,
    tags: ["stitch"],
    videoDescription: `Finished stitch using ${stitch.ugcClipName} and ${stitch.demoClipName}.`,
    originalName: `${stitch.name}.mp4`,
    clipType: "ugc",
    videoObject,
    posterObject: stitch.posterObject,
    posterBlob: stitch.posterBlob,
    posterVersion: stitch.posterVersion,
    mimeType,
    sourceMimeType: mimeType,
    size,
    originalSize: size,
    width: stitch.width,
    height: stitch.height,
    aspectRatio: stitch.height > 0 ? stitch.width / stitch.height : 0,
    duration: stitch.duration,
    defaultTrimRange: {
      start: 0,
      end: stitch.duration,
    },
    hasAudio: hasSourceAudio || Boolean(stitch.music?.enabled),
    createdAt: stitch.createdAt,
    updatedAt: stitch.createdAt,
  };
}
