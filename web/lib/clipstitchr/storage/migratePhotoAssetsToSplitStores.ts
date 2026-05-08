import {
  PHOTO_ASSETS_STORE_NAME,
  PHOTO_ASSET_BLOBS_STORE_NAME,
  PHOTO_ASSET_METADATA_STORE_NAME,
} from "@/lib/clipstitchr/constants/objectStoreNames";
import { createPhotoAssetMetadataFromAsset } from "@/lib/clipstitchr/storage/createPhotoAssetMetadataFromAsset";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";

export function migratePhotoAssetsToSplitStores(
  database: IDBDatabase,
  transaction: IDBTransaction,
) {
  if (!database.objectStoreNames.contains(PHOTO_ASSETS_STORE_NAME)) {
    return;
  }

  const sourceStore = transaction.objectStore(PHOTO_ASSETS_STORE_NAME);
  const metadataStore = transaction.objectStore(PHOTO_ASSET_METADATA_STORE_NAME);
  const blobStore = transaction.objectStore(PHOTO_ASSET_BLOBS_STORE_NAME);
  const request = sourceStore.openCursor();

  request.onsuccess = () => {
    const cursor = request.result;

    if (!cursor) {
      return;
    }

    const photo = cursor.value as PhotoAsset;

    if (photo.blob) {
      metadataStore.put(createPhotoAssetMetadataFromAsset(photo));
      blobStore.put({
        id: photo.id,
        blob: photo.blob,
        originalBlob: photo.originalBlob,
      });
    }

    cursor.continue();
  };
}
