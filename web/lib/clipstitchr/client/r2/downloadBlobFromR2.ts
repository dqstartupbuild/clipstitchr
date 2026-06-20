import { createCachedR2DownloadUrl } from "@/lib/clipstitchr/client/r2/createCachedR2DownloadUrl";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export async function downloadBlobFromR2(object: R2ObjectReference) {
  const downloadUrl = await createCachedR2DownloadUrl(object);
  const response = await fetch(downloadUrl.url);

  if (!response.ok) {
    throw new Error("Unable to download media from R2.");
  }

  const blob = await response.blob();

  if (blob.type === object.contentType) {
    return blob;
  }

  return new Blob([blob], { type: object.contentType });
}
