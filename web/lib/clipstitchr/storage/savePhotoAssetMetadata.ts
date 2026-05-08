import { PHOTO_ASSET_METADATA_STORE_NAME } from "@/lib/clipstitchr/constants/objectStoreNames";
import { getObjectStore } from "@/lib/clipstitchr/storage/getObjectStore";
import { requestToPromise } from "@/lib/clipstitchr/storage/requestToPromise";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

export async function savePhotoAssetMetadata(metadata: PhotoAssetMetadata) {
  const { store } = await getObjectStore(
    PHOTO_ASSET_METADATA_STORE_NAME,
    "readwrite",
  );

  await requestToPromise(store.put(metadata));
}
