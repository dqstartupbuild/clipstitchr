import {
  VIDEO_CLIP_BLOBS_STORE_NAME,
  VIDEO_CLIP_METADATA_STORE_NAME,
} from "@/lib/clipstitchr/constants/objectStoreNames";
import { openClipStitchrDatabase } from "@/lib/clipstitchr/storage/openClipStitchrDatabase";
import { transactionToPromise } from "@/lib/clipstitchr/storage/transactionToPromise";

export async function deleteVideoClip(id: string) {
  const database = await openClipStitchrDatabase();
  const transaction = database.transaction(
    [VIDEO_CLIP_METADATA_STORE_NAME, VIDEO_CLIP_BLOBS_STORE_NAME],
    "readwrite",
  );
  const done = transactionToPromise(transaction).finally(() =>
    database.close(),
  );

  transaction.objectStore(VIDEO_CLIP_METADATA_STORE_NAME).delete(id);
  transaction.objectStore(VIDEO_CLIP_BLOBS_STORE_NAME).delete(id);

  await done;
}
