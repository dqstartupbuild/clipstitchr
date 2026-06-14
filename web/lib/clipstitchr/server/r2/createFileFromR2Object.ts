import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";

export async function createFileFromR2Object({
  fallbackFileName,
  object,
  userId,
}: {
  fallbackFileName: string;
  object: R2ObjectReference;
  userId: string;
}) {
  assertR2ObjectKeyBelongsToUser(object.key, userId);

  const { url } = await getR2DownloadSignedUrl(object.key);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to download saved media for analysis.");
  }

  const blob = await response.blob();
  const type = object.contentType || blob.type || "application/octet-stream";

  return new File([await blob.arrayBuffer()], fallbackFileName, { type });
}
