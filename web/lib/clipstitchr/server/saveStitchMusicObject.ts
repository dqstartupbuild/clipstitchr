import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";

type SaveStitchMusicObjectOptions = {
  body: ArrayBuffer;
  contentType: string;
  stitchId: string;
  userId: string;
};

export function saveStitchMusicObject({
  body,
  contentType,
  stitchId,
  userId,
}: SaveStitchMusicObjectOptions) {
  return putR2Object({
    body,
    contentType,
    key: createR2ObjectKey({
      contentType,
      kind: "stitch-music-audio",
      recordId: stitchId,
      userId,
    }),
  });
}
