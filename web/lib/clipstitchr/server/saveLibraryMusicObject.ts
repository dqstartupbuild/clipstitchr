import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";

type SaveLibraryMusicObjectOptions = {
  body: ArrayBuffer;
  contentType: string;
  trackId: string;
  userId: string;
};

export function saveLibraryMusicObject({
  body,
  contentType,
  trackId,
  userId,
}: SaveLibraryMusicObjectOptions) {
  return putR2Object({
    body,
    contentType,
    key: createR2ObjectKey({
      contentType,
      kind: "library-music-audio",
      recordId: trackId,
      userId,
    }),
  });
}
