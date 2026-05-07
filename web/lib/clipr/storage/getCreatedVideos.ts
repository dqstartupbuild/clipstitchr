import { CREATED_VIDEOS_STORE_NAME } from "@/lib/clipr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipr/storage/requestToPromise";
import type { CreatedVideo } from "@/lib/clipr/types/CreatedVideo";

export async function getCreatedVideos() {
  const { store } = await getObjectStore(CREATED_VIDEOS_STORE_NAME, "readonly");
  const createdVideos = await requestToPromise<CreatedVideo[]>(store.getAll());

  return createdVideos.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}
