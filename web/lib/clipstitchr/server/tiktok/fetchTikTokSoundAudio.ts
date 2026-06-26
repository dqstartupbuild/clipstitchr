import { MAX_MUSIC_UPLOAD_SIZE_BYTES } from "@/lib/clipstitchr/constants/maxMusicUploadSizeBytes";
import { getTikTokImportContentType } from "@/lib/clipstitchr/server/tiktok/getTikTokImportContentType";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";

export async function fetchTikTokSoundAudio(playUrl: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(playUrl, { signal: controller.signal });

    if (!response.ok) {
      throw new Error("Unable to import that sound.");
    }

    const rawContentType =
      response.headers.get("content-type")?.split(";")[0]?.trim() ||
      "audio/mpeg";
    const contentType = getTikTokImportContentType(rawContentType);

    if (!contentType) {
      throw new Error("That TikTok sound is not in a supported audio format.");
    }

    const body = await response.arrayBuffer();

    if (body.byteLength > MAX_MUSIC_UPLOAD_SIZE_BYTES) {
      throw new Error(
        `Sounds must be ${formatBytes(MAX_MUSIC_UPLOAD_SIZE_BYTES)} or smaller.`,
      );
    }

    return { body, contentType };
  } finally {
    clearTimeout(timeout);
  }
}
