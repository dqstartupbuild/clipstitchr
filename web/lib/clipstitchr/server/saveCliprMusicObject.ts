import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";

type SaveCliprMusicObjectOptions = {
  body: ArrayBuffer;
  contentType: string;
  jobId: string;
  userId: string;
};

export function saveCliprMusicObject({
  body,
  contentType,
  jobId,
  userId,
}: SaveCliprMusicObjectOptions) {
  return putR2Object({
    body,
    contentType,
    key: createR2ObjectKey({
      contentType,
      kind: "clipr-music-audio",
      recordId: jobId,
      userId,
    }),
  });
}
