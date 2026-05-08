import {
  PHOTO_ASSET_BLOBS_STORE_NAME,
  PHOTO_ASSET_METADATA_STORE_NAME,
  PHOTO_ASSETS_STORE_NAME,
  STITCHES_STORE_NAME,
  VIDEO_CLIP_BLOBS_STORE_NAME,
  VIDEO_CLIP_METADATA_STORE_NAME,
  VIDEO_CLIPS_STORE_NAME,
} from "@/lib/clipstitchr/constants/objectStoreNames";
import { openClipStitchrDatabase } from "@/lib/clipstitchr/storage/openClipStitchrDatabase";
import { transactionToPromise } from "@/lib/clipstitchr/storage/transactionToPromise";

export async function clearClipStitchrDatabase() {
  const database = await openClipStitchrDatabase();
  const storeNames = [
    VIDEO_CLIP_METADATA_STORE_NAME,
    VIDEO_CLIP_BLOBS_STORE_NAME,
    STITCHES_STORE_NAME,
    PHOTO_ASSET_METADATA_STORE_NAME,
    PHOTO_ASSET_BLOBS_STORE_NAME,
    VIDEO_CLIPS_STORE_NAME,
    PHOTO_ASSETS_STORE_NAME,
  ].filter((storeName) => database.objectStoreNames.contains(storeName));

  if (!storeNames.length) {
    database.close();
    return;
  }

  const transaction = database.transaction(storeNames, "readwrite");
  const done = transactionToPromise(transaction).finally(() =>
    database.close(),
  );

  for (const storeName of storeNames) {
    transaction.objectStore(storeName).clear();
  }

  await done;
}
