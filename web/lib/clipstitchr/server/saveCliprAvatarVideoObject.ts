import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";

type SaveCliprAvatarVideoObjectOptions = {
  body: ArrayBuffer;
  contentType: string;
  jobId: string;
  userId: string;
};

export function saveCliprAvatarVideoObject({
  body,
  contentType,
  jobId,
  userId,
}: SaveCliprAvatarVideoObjectOptions) {
  return putR2Object({
    body,
    contentType,
    key: createR2ObjectKey({
      contentType,
      kind: "clipr-avatar-video",
      recordId: jobId,
      userId,
    }),
  });
}
