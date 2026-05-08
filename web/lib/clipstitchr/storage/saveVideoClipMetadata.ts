import { VIDEO_CLIP_METADATA_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export async function saveVideoClipMetadata(metadata: VideoClipMetadata) {
  const { store } = await getObjectStore(
    VIDEO_CLIP_METADATA_STORE_NAME,
    "readwrite",
  );

  await requestToPromise(store.put(metadata));
}
