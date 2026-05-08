import { PHOTO_ASSET_METADATA_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

export async function getPhotoAssetMetadata(id: string) {
  const { store } = await getObjectStore(
    PHOTO_ASSET_METADATA_STORE_NAME,
    "readonly",
  );

  return requestToPromise<PhotoAssetMetadata | undefined>(store.get(id));
}
