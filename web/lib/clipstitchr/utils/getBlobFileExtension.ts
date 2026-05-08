import { getMimeTypeFileExtension } from "@/lib/clipstitchr/utils/getMimeTypeFileExtension";

export function getBlobFileExtension(blob: Blob, fallback: string) {
  return getMimeTypeFileExtension(blob.type, fallback);
}
