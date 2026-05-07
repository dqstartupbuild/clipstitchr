import {
  CREATED_VIDEOS_STORE_NAME,
  VIDEO_CLIPS_STORE_NAME,
} from "@/lib/clipr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipr/storage/requestToPromise";

export async function clearCliprDatabase() {
  const clips = await getObjectStore(VIDEO_CLIPS_STORE_NAME, "readwrite");
  await requestToPromise(clips.store.clear());

  const createdVideos = await getObjectStore(CREATED_VIDEOS_STORE_NAME, "readwrite");
  await requestToPromise(createdVideos.store.clear());
}
