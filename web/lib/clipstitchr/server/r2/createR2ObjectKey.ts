import type { R2ObjectKind } from "@/lib/clipstitchr/types/R2ObjectKind";
import { getMimeTypeFileExtension } from "@/lib/clipstitchr/utils/getMimeTypeFileExtension";
import { createUserR2KeyPrefix } from "@/lib/clipstitchr/server/r2/createUserR2KeyPrefix";
import { sanitizeR2KeySegment } from "@/lib/clipstitchr/server/r2/sanitizeR2KeySegment";

const objectKindConfig: Record<
  R2ObjectKind,
  {
    directory: string;
    baseName: string;
    fallbackExtension: string;
  }
> = {
  "video-clip-video": {
    directory: "video-clips",
    baseName: "video",
    fallbackExtension: "mp4",
  },
  "video-clip-poster": {
    directory: "video-clips",
    baseName: "poster",
    fallbackExtension: "jpg",
  },
  photo: {
    directory: "photos",
    baseName: "photo",
    fallbackExtension: "jpg",
  },
  "photo-original": {
    directory: "photos",
    baseName: "original",
    fallbackExtension: "jpg",
  },
  "photo-thumbnail": {
    directory: "photos",
    baseName: "thumbnail",
    fallbackExtension: "jpg",
  },
  "swapr-segment-video": {
    directory: "swapr-segments",
    baseName: "segment",
    fallbackExtension: "mp4",
  },
  "library-music-audio": {
    directory: "library-music",
    baseName: "music",
    fallbackExtension: "mp3",
  },
  "clipr-music-audio": {
    directory: "clipr-music",
    baseName: "music",
    fallbackExtension: "mp3",
  },
  "clipr-avatar-video": {
    directory: "clipr-scenes",
    baseName: "avatar",
    fallbackExtension: "mp4",
  },
  "clipr-scene-image": {
    directory: "clipr-scenes",
    baseName: "image",
    fallbackExtension: "jpg",
  },
  "clipr-scene-video": {
    directory: "clipr-scenes",
    baseName: "scene",
    fallbackExtension: "mp4",
  },
  "longr-video": {
    directory: "longr",
    baseName: "video",
    fallbackExtension: "mp4",
  },
  "longr-poster": {
    directory: "longr",
    baseName: "poster",
    fallbackExtension: "jpg",
  },
  "stitch-music-audio": {
    directory: "stitch-music",
    baseName: "music",
    fallbackExtension: "mp3",
  },
  "stitch-video": {
    directory: "stitches",
    baseName: "video",
    fallbackExtension: "mp4",
  },
  "stitch-poster": {
    directory: "stitches",
    baseName: "poster",
    fallbackExtension: "jpg",
  },
  "swipe-poster": {
    directory: "swipes",
    baseName: "poster",
    fallbackExtension: "png",
  },
};

type CreateR2ObjectKeyOptions = {
  userId: string;
  kind: R2ObjectKind;
  recordId: string;
  contentType: string;
};

export function createR2ObjectKey({
  userId,
  kind,
  recordId,
  contentType,
}: CreateR2ObjectKeyOptions) {
  const config = objectKindConfig[kind];
  const extension = getMimeTypeFileExtension(
    contentType,
    config.fallbackExtension,
  );

  return [
    createUserR2KeyPrefix(userId).replace(/\/$/, ""),
    config.directory,
    sanitizeR2KeySegment(recordId),
    `${config.baseName}.${extension}`,
  ].join("/");
}
