import { CREATED_VIDEOS_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";
import type { CreatedVideo } from "@/lib/clipstitchr/types/CreatedVideo";

export async function getCreatedVideo(id: string) {
  const { store } = await getObjectStore(CREATED_VIDEOS_STORE_NAME, "readonly");

  return requestToPromise<CreatedVideo | undefined>(store.get(id));
}
