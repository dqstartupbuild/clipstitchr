import { PHOTO_ASSETS_STORE_NAME } from "@/lib/clipr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipr/storage/requestToPromise";
import type { PhotoAsset } from "@/lib/clipr/types/PhotoAsset";

export async function savePhotoAsset(photo: PhotoAsset) {
  const { store } = await getObjectStore(PHOTO_ASSETS_STORE_NAME, "readwrite");
  await requestToPromise(store.put(photo));
}
