import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export function createR2ImageBlobCacheRequest(object: R2ObjectReference) {
  if (typeof window === "undefined") {
    return null;
  }

  const url = new URL("/clipstitchr-r2-image-cache", window.location.origin);

  url.searchParams.set("key", object.key);
  url.searchParams.set("contentType", object.contentType);
  url.searchParams.set("size", String(object.size));

  return new Request(url.toString(), {
    method: "GET",
  });
}
