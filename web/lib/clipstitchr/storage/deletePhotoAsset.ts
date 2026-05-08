import {
  PHOTO_ASSET_BLOBS_STORE_NAME,
  PHOTO_ASSET_METADATA_STORE_NAME,
} from "@/lib/clipstitchr/constants/objectStoreNames";
import { openClipStitchrDatabase } from "@/lib/clipstitchr/storage/openClipStitchrDatabase";
import { transactionToPromise } from "@/lib/clipstitchr/storage/transactionToPromise";

export async function deletePhotoAsset(id: string) {
  const database = await openClipStitchrDatabase();
  const transaction = database.transaction(
    [PHOTO_ASSET_METADATA_STORE_NAME, PHOTO_ASSET_BLOBS_STORE_NAME],
    "readwrite",
  );
  const done = transactionToPromise(transaction).finally(() =>
    database.close(),
  );

  transaction.objectStore(PHOTO_ASSET_METADATA_STORE_NAME).delete(id);
  transaction.objectStore(PHOTO_ASSET_BLOBS_STORE_NAME).delete(id);

  await done;
}
