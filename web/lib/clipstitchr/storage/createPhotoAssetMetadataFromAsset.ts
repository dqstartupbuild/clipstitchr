import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

export function createPhotoAssetMetadataFromAsset(
  photo: PhotoAsset,
): PhotoAssetMetadata {
  const metadata = { ...photo } as Partial<PhotoAsset>;

  delete metadata.blob;
  delete metadata.originalBlob;

  return metadata as PhotoAssetMetadata;
}
