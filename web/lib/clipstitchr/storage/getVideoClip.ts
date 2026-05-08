import { VIDEO_CLIPS_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

export async function getVideoClip(id: string) {
  const { store } = await getObjectStore(VIDEO_CLIPS_STORE_NAME, "readonly");

  return requestToPromise<VideoClip | undefined>(store.get(id));
}
