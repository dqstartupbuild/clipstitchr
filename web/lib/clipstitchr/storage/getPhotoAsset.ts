import { createHydratedPhotoAsset } from "@/lib/clipstitchr/storage/createHydratedPhotoAsset";
import { getPhotoAssetBlob } from "@/lib/clipstitchr/storage/getPhotoAssetBlob";
import { getPhotoAssetMetadata } from "@/lib/clipstitchr/storage/getPhotoAssetMetadata";

export async function getPhotoAsset(id: string) {
  const [metadata, blobRecord] = await Promise.all([
    getPhotoAssetMetadata(id),
    getPhotoAssetBlob(id),
  ]);

  if (!metadata || !blobRecord) {
    return undefined;
  }

  return createHydratedPhotoAsset(metadata, blobRecord);
}
