import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";

export function saveHookLabThumbnail({
  body,
  postId,
  ownerId,
}: {
  body: Uint8Array;
  postId: string;
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
      recordId: postId,
      userId: ownerId,
    }),
  });
}
