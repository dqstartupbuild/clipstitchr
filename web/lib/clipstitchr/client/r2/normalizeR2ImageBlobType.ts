import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export function normalizeR2ImageBlobType(
  object: R2ObjectReference,
  blob: Blob,
) {
  if (blob.type === object.contentType) {
    return blob;
  }

  return new Blob([blob], {
    type: object.contentType,
  });
}
