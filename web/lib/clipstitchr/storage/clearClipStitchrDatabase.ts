import {
  PHOTO_ASSETS_STORE_NAME,
  STITCHES_STORE_NAME,
  VIDEO_CLIPS_STORE_NAME,
} from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";

export async function clearClipStitchrDatabase() {
  const clips = await getObjectStore(VIDEO_CLIPS_STORE_NAME, "readwrite");
  await requestToPromise(clips.store.clear());

  const stitches = await getObjectStore(STITCHES_STORE_NAME, "readwrite");
  await requestToPromise(stitches.store.clear());

  const photoAssets = await getObjectStore(PHOTO_ASSETS_STORE_NAME, "readwrite");
  await requestToPromise(photoAssets.store.clear());
}
