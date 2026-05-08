import { PHOTO_ASSETS_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";

export async function savePhotoAsset(photo: PhotoAsset) {
  const { store } = await getObjectStore(PHOTO_ASSETS_STORE_NAME, "readwrite");
  await requestToPromise(store.put(photo));
}
