import {
  VIDEO_CLIP_BLOBS_STORE_NAME,
  VIDEO_CLIP_METADATA_STORE_NAME,
  VIDEO_CLIPS_STORE_NAME,
} from "@/lib/clipstitchr/constants/objectStoreNames";
import { createVideoClipMetadataFromClip } from "@/lib/clipstitchr/storage/createVideoClipMetadataFromClip";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

export function migrateVideoClipsToSplitStores(
  database: IDBDatabase,
  transaction: IDBTransaction,
) {
  if (!database.objectStoreNames.contains(VIDEO_CLIPS_STORE_NAME)) {
    return;
  }

  const sourceStore = transaction.objectStore(VIDEO_CLIPS_STORE_NAME);
  const metadataStore = transaction.objectStore(VIDEO_CLIP_METADATA_STORE_NAME);
  const blobStore = transaction.objectStore(VIDEO_CLIP_BLOBS_STORE_NAME);
  const request = sourceStore.openCursor();

  request.onsuccess = () => {
    const cursor = request.result;

    if (!cursor) {
      return;
    }

    const clip = cursor.value as VideoClip;

    if (clip.blob) {
      metadataStore.put(createVideoClipMetadataFromClip(clip));
      blobStore.put({
        id: clip.id,
        blob: clip.blob,
      });
    }

    cursor.continue();
  };
}
