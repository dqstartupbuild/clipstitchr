import { createSharedMusicR2ObjectKey } from "@/lib/clipstitchr/server/r2/createSharedMusicR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";

type SaveSharedMusicObjectOptions = {
  body: ArrayBuffer;
  contentType: string;
  trackId: string;
};

export function saveSharedMusicObject({
  body,
  contentType,
  trackId,
}: SaveSharedMusicObjectOptions) {
  return putR2Object({
    body,
    contentType,
    key: createSharedMusicR2ObjectKey({
      contentType,
      recordId: trackId,
    }),
  });
}
