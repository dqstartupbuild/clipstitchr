import { createR2ImageBlobCacheRequest } from "@/lib/clipstitchr/client/r2/createR2ImageBlobCacheRequest";
import { getR2ImageBlobCache } from "@/lib/clipstitchr/client/r2/getR2ImageBlobCache";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export async function writeCachedR2ImageBlob(
  object: R2ObjectReference,
  blob: Blob,
) {
  const cache = await getR2ImageBlobCache();
  const request = createR2ImageBlobCacheRequest(object);

  if (!cache || !request) {
    return;
  }

  await cache.put(
    request,
    new Response(blob, {
      headers: {
        "Cache-Control": "max-age=31536000, immutable",
        "Content-Type": object.contentType,
      },
    }),
  );
}
