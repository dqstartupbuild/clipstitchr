import { createR2DownloadUrl } from "@/lib/clipstitchr/client/r2/createR2DownloadUrl";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type CachedR2DownloadUrl = {
  expiresAt: number;
  url: string;
};

const r2DownloadUrlsByKey = new Map<string, CachedR2DownloadUrl>();
const DOWNLOAD_URL_EXPIRY_BUFFER_MS = 30_000;

export async function createCachedR2DownloadUrl(object: R2ObjectReference) {
  const cachedDownloadUrl = r2DownloadUrlsByKey.get(object.key);

  if (cachedDownloadUrl && cachedDownloadUrl.expiresAt > Date.now()) {
    return {
      expiresIn: Math.floor((cachedDownloadUrl.expiresAt - Date.now()) / 1000),
      url: cachedDownloadUrl.url,
    };
  }

  const downloadUrl = await createR2DownloadUrl(object);

  r2DownloadUrlsByKey.set(object.key, {
    expiresAt:
      Date.now() +
      Math.max(0, downloadUrl.expiresIn * 1000 - DOWNLOAD_URL_EXPIRY_BUFFER_MS),
    url: downloadUrl.url,
  });

  return downloadUrl;
}
