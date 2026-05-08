import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { PhotoAssetBlob } from "@/lib/clipstitchr/types/PhotoAssetBlob";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

export function createHydratedPhotoAsset(
  metadata: PhotoAssetMetadata,
  blobRecord: PhotoAssetBlob,
): PhotoAsset {
  return {
    ...metadata,
    blob: blobRecord.blob,
    originalBlob: blobRecord.originalBlob,
  };
}
