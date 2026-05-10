import { readR2JsonResponse } from "@/lib/clipstitchr/client/r2/readR2JsonResponse";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type R2DownloadUrlResponse = {
  expiresIn: number;
  url: string;
};

export async function createR2DownloadUrl(object: R2ObjectReference) {
  const downloadUrlResponse = await fetch("/api/r2/download-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: object.key,
    }),
  });

  return await readR2JsonResponse<R2DownloadUrlResponse>(downloadUrlResponse);
}
