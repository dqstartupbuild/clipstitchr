import { PHOTO_ASSET_METADATA_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

type GetPhotoAssetMetadataPageOptions = {
  offset?: number;
  limit: number;
};

export async function getPhotoAssetMetadataPage({
  offset = 0,
  limit,
}: GetPhotoAssetMetadataPageOptions) {
  if (limit <= 0) {
    return [];
  }

  const { store } = await getObjectStore(
    PHOTO_ASSET_METADATA_STORE_NAME,
    "readonly",
  );
  const index = store.index("createdAt");

  return new Promise<PhotoAssetMetadata[]>((resolve, reject) => {
    const metadata: PhotoAssetMetadata[] = [];
    const request = index.openCursor(null, "prev");
    let hasAdvanced = offset === 0;

    request.onsuccess = () => {
      const cursor = request.result;

      if (!cursor || metadata.length >= limit) {
        resolve(metadata);
        return;
      }

      if (!hasAdvanced) {
        hasAdvanced = true;
        cursor.advance(offset);
        return;
      }

      metadata.push(cursor.value as PhotoAssetMetadata);
      cursor.continue();
    };

    request.onerror = () => reject(request.error);
  });
}
