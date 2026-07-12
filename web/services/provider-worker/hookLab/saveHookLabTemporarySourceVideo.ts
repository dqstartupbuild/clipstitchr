import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";

export function saveHookLabTemporarySourceVideo({
  body,
  contentType,
  ownerId,
  recordId,
}: {
  body: Uint8Array;
  contentType: string;
  ownerId: string;
  recordId: string;
}) {
  return putR2Object({
    body: body.buffer.slice(
      body.byteOffset,
      body.byteOffset + body.byteLength,
    ) as ArrayBuffer,
    contentType,
    key: createR2ObjectKey({
      contentType,
      kind: "hook-lab-source-video",
      recordId,
      userId: ownerId,
    }),
  });
}
