import { CREATED_VIDEOS_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";
import type { CreatedVideo } from "@/lib/clipstitchr/types/CreatedVideo";

export async function saveCreatedVideo(createdVideo: CreatedVideo) {
  const { store } = await getObjectStore(CREATED_VIDEOS_STORE_NAME, "readwrite");
  await requestToPromise(store.put(createdVideo));
}
