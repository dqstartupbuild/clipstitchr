import { createMusicTrackDownloadUrl } from "@/lib/clipstitchr/client/r2/createMusicTrackDownloadUrl";

type CachedMusicTrackDownloadUrl = {
  expiresAt: number;
  url: string;
};

const musicTrackDownloadUrlsById = new Map<string, CachedMusicTrackDownloadUrl>();
const DOWNLOAD_URL_EXPIRY_BUFFER_MS = 30_000;

export async function createCachedMusicTrackDownloadUrl(id: string) {
  const cachedDownloadUrl = musicTrackDownloadUrlsById.get(id);

  if (cachedDownloadUrl && cachedDownloadUrl.expiresAt > Date.now()) {
    return {
      expiresIn: Math.floor((cachedDownloadUrl.expiresAt - Date.now()) / 1000),
      url: cachedDownloadUrl.url,
    };
  }

  const downloadUrl = await createMusicTrackDownloadUrl(id);

  musicTrackDownloadUrlsById.set(id, {
    expiresAt:
      Date.now() +
      Math.max(0, downloadUrl.expiresIn * 1000 - DOWNLOAD_URL_EXPIRY_BUFFER_MS),
    url: downloadUrl.url,
  });

  return downloadUrl;
}
