import { PHOTO_ASSET_BLOBS_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";
import type { PhotoAssetBlob } from "@/lib/clipstitchr/types/PhotoAssetBlob";

export async function getPhotoAssetBlob(id: string) {
  const { store } = await getObjectStore(
    PHOTO_ASSET_BLOBS_STORE_NAME,
    "readonly",
  );

  return requestToPromise<PhotoAssetBlob | undefined>(store.get(id));
}
