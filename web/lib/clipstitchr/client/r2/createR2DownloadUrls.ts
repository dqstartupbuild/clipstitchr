import { readR2JsonResponse } from "@/lib/clipstitchr/client/r2/readR2JsonResponse";

export type R2DownloadUrlListItem = {
  expiresIn: number;
  key: string;
  url: string;
};

type R2DownloadUrlsResponse = {
  urls: R2DownloadUrlListItem[];
};

export async function createR2DownloadUrls(keys: string[]) {
  if (keys.length === 0) {
    return [];
  }

  const downloadUrlsResponse = await fetch("/api/r2/download-urls", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keys,
    }),
  });

  const body = await readR2JsonResponse<R2DownloadUrlsResponse>(
    downloadUrlsResponse,
  );

  return body.urls;
}
