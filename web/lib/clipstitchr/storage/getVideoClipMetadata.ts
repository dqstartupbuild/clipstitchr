import { VIDEO_CLIP_METADATA_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export async function getVideoClipMetadata(id: string) {
  const { store } = await getObjectStore(
    VIDEO_CLIP_METADATA_STORE_NAME,
    "readonly",
  );

  return requestToPromise<VideoClipMetadata | undefined>(store.get(id));
}
