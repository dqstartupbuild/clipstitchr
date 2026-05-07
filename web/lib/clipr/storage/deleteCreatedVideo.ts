import { CREATED_VIDEOS_STORE_NAME } from "@/lib/clipr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipr/storage/requestToPromise";

export async function deleteCreatedVideo(id: string) {
  const { store } = await getObjectStore(CREATED_VIDEOS_STORE_NAME, "readwrite");
  await requestToPromise(store.delete(id));
}
