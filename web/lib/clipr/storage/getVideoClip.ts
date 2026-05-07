import { VIDEO_CLIPS_STORE_NAME } from "@/lib/clipr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipr/storage/requestToPromise";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";

export async function getVideoClip(id: string) {
  const { store } = await getObjectStore(VIDEO_CLIPS_STORE_NAME, "readonly");

  return requestToPromise<VideoClip | undefined>(store.get(id));
}
