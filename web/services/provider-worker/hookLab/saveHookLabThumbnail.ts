import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";

export function saveHookLabThumbnail({
  body,
  ideaId,
  ownerId,
}: {
  body: Uint8Array;
  ideaId: string;
  ownerId: string;
}) {
  return putR2Object({
    body: body.buffer.slice(
      body.byteOffset,
      body.byteOffset + body.byteLength,
    ) as ArrayBuffer,
    contentType: "image/jpeg",
    key: createR2ObjectKey({
      contentType: "image/jpeg",
      kind: "hook-lab-thumbnail",
      recordId: ideaId,
      userId: ownerId,
    }),
  });
}
