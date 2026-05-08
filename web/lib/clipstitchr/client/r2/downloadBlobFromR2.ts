import { readR2JsonResponse } from "@/lib/clipstitchr/client/r2/readR2JsonResponse";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type DownloadUrlResponse = {
  url: string;
};

export async function downloadBlobFromR2(object: R2ObjectReference) {
  const downloadUrlResponse = await fetch("/api/r2/download-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: object.key,
    }),
  });
  const downloadUrl = await readR2JsonResponse<DownloadUrlResponse>(
    downloadUrlResponse,
  );
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
