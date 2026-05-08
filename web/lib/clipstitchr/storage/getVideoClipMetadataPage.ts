import { VIDEO_CLIP_METADATA_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type GetVideoClipMetadataPageOptions = {
  offset?: number;
  limit: number;
};

export async function getVideoClipMetadataPage({
  offset = 0,
  limit,
}: GetVideoClipMetadataPageOptions) {
  if (limit <= 0) {
    return [];
  }

  const { store } = await getObjectStore(
    VIDEO_CLIP_METADATA_STORE_NAME,
    "readonly",
  );
  const index = store.index("createdAt");

  return new Promise<VideoClipMetadata[]>((resolve, reject) => {
    const metadata: VideoClipMetadata[] = [];
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

      metadata.push(cursor.value as VideoClipMetadata);
      cursor.continue();
    };

    request.onerror = () => reject(request.error);
  });
}
