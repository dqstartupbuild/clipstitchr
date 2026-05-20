import { createR2DownloadUrls } from "@/lib/clipstitchr/client/r2/createR2DownloadUrls";
import { normalizeR2ImageBlobType } from "@/lib/clipstitchr/client/r2/normalizeR2ImageBlobType";
import { readCachedR2ImageBlob } from "@/lib/clipstitchr/client/r2/readCachedR2ImageBlob";
import { writeCachedR2ImageBlob } from "@/lib/clipstitchr/client/r2/writeCachedR2ImageBlob";
import { r2DownloadUrlBatchMaxKeys } from "@/lib/clipstitchr/constants/r2DownloadUrlBatchMaxKeys";
import { r2ImageBlobFetchConcurrency } from "@/lib/clipstitchr/constants/r2ImageBlobFetchConcurrency";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { mapWithConcurrency } from "@/lib/clipstitchr/utils/mapWithConcurrency";

function dedupeR2ObjectsByKey(objects: R2ObjectReference[]) {
  const objectByKey = new Map<string, R2ObjectReference>();

  for (const object of objects) {
    if (!objectByKey.has(object.key)) {
      objectByKey.set(object.key, object);
    }
  }

  return objectByKey;
}

export async function downloadCachedR2ImageBlobs(
  objects: R2ObjectReference[],
) {
  const blobsByKey = new Map<string, Blob>();
  const objectByKey = dedupeR2ObjectsByKey(objects);
  const missingObjects: R2ObjectReference[] = [];

  await mapWithConcurrency(
    [...objectByKey.values()],
    r2ImageBlobFetchConcurrency,
    async (object) => {
      const cachedBlob = await readCachedR2ImageBlob(object).catch(() => null);

      if (cachedBlob) {
        blobsByKey.set(object.key, cachedBlob);
        return;
      }

      missingObjects.push(object);
    },
  );

  for (
    let startIndex = 0;
    startIndex < missingObjects.length;
    startIndex += r2DownloadUrlBatchMaxKeys
  ) {
    const batchObjects = missingObjects.slice(
      startIndex,
      startIndex + r2DownloadUrlBatchMaxKeys,
    );
    const signedUrls = await createR2DownloadUrls(
      batchObjects.map((object) => object.key),
    );

    await mapWithConcurrency(
      signedUrls,
      r2ImageBlobFetchConcurrency,
      async (signedUrl) => {
        const object = objectByKey.get(signedUrl.key);

        if (!object) {
          return;
        }

        const response = await fetch(signedUrl.url);

        if (!response.ok) {
          throw new Error("Unable to download image from R2.");
        }

        const blob = normalizeR2ImageBlobType(object, await response.blob());

        blobsByKey.set(object.key, blob);
        await writeCachedR2ImageBlob(object, blob).catch(() => undefined);
      },
    );
  }

  return blobsByKey;
}
