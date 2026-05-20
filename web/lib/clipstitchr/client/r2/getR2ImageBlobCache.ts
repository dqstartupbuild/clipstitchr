const r2ImageBlobCacheName = "clipstitchr-r2-image-blobs-v1";

export async function getR2ImageBlobCache() {
  if (typeof window === "undefined" || !("caches" in window)) {
    return null;
  }

  return await window.caches.open(r2ImageBlobCacheName);
}
