const cacheableImageKeyPattern = /\/(?:poster|thumbnail)\.[a-z0-9]+$/i;

export function assertR2DownloadUrlsKeyIsCacheableImage(key: string) {
  if (!cacheableImageKeyPattern.test(key)) {
    throw new Error("Batch R2 download URLs are limited to poster and thumbnail images.");
  }
}
