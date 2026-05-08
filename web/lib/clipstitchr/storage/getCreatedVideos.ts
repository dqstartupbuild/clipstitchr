import { CREATED_VIDEOS_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";
import type { CreatedVideo } from "@/lib/clipstitchr/types/CreatedVideo";

export async function getCreatedVideos() {
  const { store } = await getObjectStore(CREATED_VIDEOS_STORE_NAME, "readonly");
  const createdVideos = await requestToPromise<CreatedVideo[]>(store.getAll());

  return createdVideos.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}
