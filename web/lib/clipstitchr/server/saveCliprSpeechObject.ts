import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";

type SaveCliprSpeechObjectOptions = {
  body: ArrayBuffer;
  contentType: string;
  jobId: string;
  userId: string;
};

export function saveCliprSpeechObject({
  body,
  contentType,
  jobId,
  userId,
}: SaveCliprSpeechObjectOptions) {
  return putR2Object({
    body,
    contentType,
    key: createR2ObjectKey({
      contentType,
      kind: "clipr-speech-audio",
      recordId: jobId,
      userId,
    }),
  });
}
