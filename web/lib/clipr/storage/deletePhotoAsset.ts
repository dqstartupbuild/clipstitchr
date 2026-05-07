import { PHOTO_ASSETS_STORE_NAME } from "@/lib/clipr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipr/storage/requestToPromise";

export async function deletePhotoAsset(id: string) {
  const { store } = await getObjectStore(PHOTO_ASSETS_STORE_NAME, "readwrite");
  await requestToPromise(store.delete(id));
}
