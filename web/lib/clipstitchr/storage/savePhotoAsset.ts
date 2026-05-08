import {
  PHOTO_ASSET_BLOBS_STORE_NAME,
  PHOTO_ASSET_METADATA_STORE_NAME,
} from "@/lib/clipstitchr/constants/objectStoreNames";
import { createPhotoAssetMetadataFromAsset } from "@/lib/clipstitchr/storage/createPhotoAssetMetadataFromAsset";
import { openClipStitchrDatabase } from "@/lib/clipstitchr/storage/openClipStitchrDatabase";
import { transactionToPromise } from "@/lib/clipstitchr/storage/transactionToPromise";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";

export async function savePhotoAsset(photo: PhotoAsset) {
  const database = await openClipStitchrDatabase();
  const transaction = database.transaction(
    [PHOTO_ASSET_METADATA_STORE_NAME, PHOTO_ASSET_BLOBS_STORE_NAME],
    "readwrite",
  );
  const done = transactionToPromise(transaction).finally(() =>
    database.close(),
  );

  transaction
    .objectStore(PHOTO_ASSET_METADATA_STORE_NAME)
    .put(createPhotoAssetMetadataFromAsset(photo));
  transaction.objectStore(PHOTO_ASSET_BLOBS_STORE_NAME).put({
    id: photo.id,
    blob: photo.blob,
    originalBlob: photo.originalBlob,
  });

  await done;
}
