import type { R2UploadResult } from "@/lib/clipstitchr/publishing/media/R2UploadResult";

type PutBlobToR2Options = {
  blob: Blob;
  contentType: string;
  key: string;
  size: number;
  url: string;
  checksumSha256?: string;
  preventOverwrite?: boolean;
};

export async function putBlobToR2({
  blob,
  contentType,
  key,
  size,
  url,
  checksumSha256,
  preventOverwrite,
}: PutBlobToR2Options): Promise<R2UploadResult> {
  if (blob.size !== size) {
    throw new Error("R2 upload size does not match its signed grant.");
  }

  const uploadResponse = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      ...(checksumSha256
        ? {
            "x-amz-checksum-sha256": checksumSha256,
            "x-amz-meta-checksum-sha256": checksumSha256,
          }
        : {}),
      ...(preventOverwrite ? { "If-None-Match": "*" } : {}),
    },
    body: blob,
  });

  if (!uploadResponse.ok && !(preventOverwrite && uploadResponse.status === 412)) {
    throw new Error("Unable to upload media to R2.");
  }

  const etag = uploadResponse.headers.get("etag")?.trim();
  const versionId = uploadResponse.headers.get("x-amz-version-id")?.trim();

  return {
    key,
    contentType,
    size,
    ...(etag ? { etag } : {}),
    ...(versionId ? { versionId } : {}),
  };
}
