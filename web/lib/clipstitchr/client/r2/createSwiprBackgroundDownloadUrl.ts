import { readR2JsonResponse } from "@/lib/clipstitchr/client/r2/readR2JsonResponse";

type SwiprBackgroundDownloadUrlResponse = {
  url: string;
  expiresIn: number;
};

export async function createSwiprBackgroundDownloadUrl(id: string) {
  const response = await fetch("/api/swipr/backgrounds/download-url", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  return await readR2JsonResponse<SwiprBackgroundDownloadUrlResponse>(response);
}
