import { readR2JsonResponse } from "@/lib/clipstitchr/client/r2/readR2JsonResponse";
import type { R2ObjectKind } from "@/lib/clipstitchr/types/R2ObjectKind";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type UploadBlobToR2Options = {
  blob: Blob;
  kind: R2ObjectKind;
  recordId: string;
};

type UploadUrlResponse = {
  key: string;
  url: string;
};

export async function uploadBlobToR2({
  blob,
  kind,
  recordId,
}: UploadBlobToR2Options): Promise<R2ObjectReference> {
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
  const uploadUrl = await readR2JsonResponse<UploadUrlResponse>(
    uploadUrlResponse,
  );
  const uploadResponse = await fetch(uploadUrl.url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error("Unable to upload media to R2.");
  }

  return {
    key: uploadUrl.key,
    contentType,
    size: blob.size,
  };
}
