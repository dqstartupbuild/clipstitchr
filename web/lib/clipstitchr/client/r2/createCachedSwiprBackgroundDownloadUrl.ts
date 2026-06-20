import { createSwiprBackgroundDownloadUrl } from "@/lib/clipstitchr/client/r2/createSwiprBackgroundDownloadUrl";

type CachedSwiprBackgroundDownloadUrl = {
  expiresAt: number;
  url: string;
};

const swiprBackgroundDownloadUrlsById = new Map<
  string,
  CachedSwiprBackgroundDownloadUrl
>();
const DOWNLOAD_URL_EXPIRY_BUFFER_MS = 30_000;

export async function createCachedSwiprBackgroundDownloadUrl(id: string) {
  const cachedDownloadUrl = swiprBackgroundDownloadUrlsById.get(id);

  if (cachedDownloadUrl && cachedDownloadUrl.expiresAt > Date.now()) {
    return {
      expiresIn: Math.floor((cachedDownloadUrl.expiresAt - Date.now()) / 1000),
      url: cachedDownloadUrl.url,
    };
  }

  const downloadUrl = await createSwiprBackgroundDownloadUrl(id);

  swiprBackgroundDownloadUrlsById.set(id, {
    expiresAt:
      Date.now() +
      Math.max(0, downloadUrl.expiresIn * 1000 - DOWNLOAD_URL_EXPIRY_BUFFER_MS),
    url: downloadUrl.url,
  });

  return downloadUrl;
}
