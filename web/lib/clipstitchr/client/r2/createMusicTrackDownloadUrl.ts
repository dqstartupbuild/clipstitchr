import { enqueueR2DownloadUrlRequest } from "@/lib/clipstitchr/client/r2/enqueueR2DownloadUrlRequest";
import { readR2JsonResponse } from "@/lib/clipstitchr/client/r2/readR2JsonResponse";

type MusicTrackDownloadUrlResponse = {
  expiresIn: number;
  url: string;
};

export async function createMusicTrackDownloadUrl(id: string) {
  return await enqueueR2DownloadUrlRequest(async () => {
    const response = await fetch("/api/music/download-url", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    return await readR2JsonResponse<MusicTrackDownloadUrlResponse>(response);
  });
}
