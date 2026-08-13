import type { R2UploadResult } from "@/lib/clipstitchr/publishing/media/R2UploadResult";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export function toR2ObjectReference(
  object: R2UploadResult,
): R2ObjectReference {
  return {
    contentType: object.contentType,
    key: object.key,
    size: object.size,
  };
}
