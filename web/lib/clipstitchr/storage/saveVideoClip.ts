import {
  VIDEO_CLIP_BLOBS_STORE_NAME,
  VIDEO_CLIP_METADATA_STORE_NAME,
} from "@/lib/clipstitchr/constants/objectStoreNames";
import { createVideoClipMetadataFromClip } from "@/lib/clipstitchr/storage/createVideoClipMetadataFromClip";
import { openClipStitchrDatabase } from "@/lib/clipstitchr/storage/openClipStitchrDatabase";
import { transactionToPromise } from "@/lib/clipstitchr/storage/transactionToPromise";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

export async function saveVideoClip(clip: VideoClip) {
  const database = await openClipStitchrDatabase();
  const transaction = database.transaction(
    [VIDEO_CLIP_METADATA_STORE_NAME, VIDEO_CLIP_BLOBS_STORE_NAME],
    "readwrite",
  );
  const done = transactionToPromise(transaction).finally(() =>
    database.close(),
  );

  transaction
    .objectStore(VIDEO_CLIP_METADATA_STORE_NAME)
    .put(createVideoClipMetadataFromClip(clip));
  transaction.objectStore(VIDEO_CLIP_BLOBS_STORE_NAME).put({
    id: clip.id,
    blob: clip.blob,
  });

  await done;
}
