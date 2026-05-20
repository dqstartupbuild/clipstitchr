import { createR2ImageBlobCacheRequest } from "@/lib/clipstitchr/client/r2/createR2ImageBlobCacheRequest";
import { getR2ImageBlobCache } from "@/lib/clipstitchr/client/r2/getR2ImageBlobCache";
import { normalizeR2ImageBlobType } from "@/lib/clipstitchr/client/r2/normalizeR2ImageBlobType";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export async function readCachedR2ImageBlob(object: R2ObjectReference) {
  const cache = await getR2ImageBlobCache();
  const request = createR2ImageBlobCacheRequest(object);

  if (!cache || !request) {
    return null;
  }

  const response = await cache.match(request);

  if (!response) {
    return null;
  }

  return normalizeR2ImageBlobType(object, await response.blob());
}
