import { PHOTO_ASSETS_STORE_NAME } from "@/lib/clipr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipr/storage/requestToPromise";
import type { PhotoAsset } from "@/lib/clipr/types/PhotoAsset";

export async function getPhotoAssets() {
  const { store } = await getObjectStore(PHOTO_ASSETS_STORE_NAME, "readonly");
  const photos = await requestToPromise<PhotoAsset[]>(store.getAll());

  return photos.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
