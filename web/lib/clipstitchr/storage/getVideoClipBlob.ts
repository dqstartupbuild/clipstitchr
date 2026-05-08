import { VIDEO_CLIP_BLOBS_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";
import type { VideoClipBlob } from "@/lib/clipstitchr/types/VideoClipBlob";

export async function getVideoClipBlob(id: string) {
  const { store } = await getObjectStore(
    VIDEO_CLIP_BLOBS_STORE_NAME,
    "readonly",
  );

  return requestToPromise<VideoClipBlob | undefined>(store.get(id));
}
