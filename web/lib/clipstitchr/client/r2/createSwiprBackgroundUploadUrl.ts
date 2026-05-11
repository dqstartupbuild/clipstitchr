import { readR2JsonResponse } from "@/lib/clipstitchr/client/r2/readR2JsonResponse";

type CreateSwiprBackgroundUploadUrlOptions = {
  blob: Blob;
  recordId: string;
};

type SwiprBackgroundUploadUrlResponse = {
  key: string;
  url: string;
  expiresIn: number;
};

export async function createSwiprBackgroundUploadUrl({
  blob,
  recordId,
}: CreateSwiprBackgroundUploadUrlOptions) {
  const contentType = blob.type || "image/jpeg";
  const response = await fetch("/api/swipr/backgrounds/upload-url", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      recordId,
      contentType,
      sizeBytes: blob.size,
    }),
  });
  const uploadUrl =
    await readR2JsonResponse<SwiprBackgroundUploadUrlResponse>(response);

  return {
    ...uploadUrl,
    contentType,
    size: blob.size,
  };
}
