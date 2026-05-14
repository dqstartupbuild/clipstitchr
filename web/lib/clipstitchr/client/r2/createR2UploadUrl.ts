import { readR2JsonResponse } from "@/lib/clipstitchr/client/r2/readR2JsonResponse";
import type { R2ObjectKind } from "@/lib/clipstitchr/types/R2ObjectKind";

type CreateR2UploadUrlOptions = {
  blob: Blob;
  kind: R2ObjectKind;
  recordId: string;
};

type R2UploadUrl = {
  contentType: string;
  key: string;
  size: number;
  url: string;
};

export async function createR2UploadUrl({
  blob,
  kind,
  recordId,
}: CreateR2UploadUrlOptions): Promise<R2UploadUrl> {
  const contentType = blob.type || "application/octet-stream";
  const uploadUrlResponse = await fetch("/api/r2/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kind,
      recordId,
      contentType,
      sizeBytes: blob.size,
    }),
  });
  const uploadUrl = await readR2JsonResponse<{ key: string; url: string }>(
    uploadUrlResponse,
  );

  return {
    contentType,
    key: uploadUrl.key,
    size: blob.size,
    url: uploadUrl.url,
  };
}
