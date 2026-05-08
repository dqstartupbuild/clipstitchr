import { PHOTO_ASSETS_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";

export async function getPhotoAssets() {
  const { store } = await getObjectStore(PHOTO_ASSETS_STORE_NAME, "readonly");
  const photos = await requestToPromise<PhotoAsset[]>(store.getAll());

  return photos.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
