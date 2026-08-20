import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type R2UploadedObject = R2ObjectReference & Record<string, unknown>;

export function toR2ObjectReference(
  object: R2UploadedObject,
): R2ObjectReference {
  return {
    contentType: object.contentType,
    key: object.key,
    size: object.size,
  };
}
