import { getMimeTypeFileExtension } from "@/lib/clipstitchr/utils/getMimeTypeFileExtension";
import { sanitizeR2KeySegment } from "@/lib/clipstitchr/server/r2/sanitizeR2KeySegment";

type CreateSharedMusicR2ObjectKeyOptions = {
  recordId: string;
  contentType: string;
};

export function createSharedMusicR2ObjectKey({
  recordId,
  contentType,
}: CreateSharedMusicR2ObjectKeyOptions) {
  const extension = getMimeTypeFileExtension(contentType, "mp3");

  return [
    "shared",
    "music",
    sanitizeR2KeySegment(recordId),
    `audio.${extension}`,
  ].join("/");
}
