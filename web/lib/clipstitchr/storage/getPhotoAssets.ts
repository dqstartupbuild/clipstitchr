import { indexedDbLibraryReadPageSize } from "@/lib/clipstitchr/constants/indexedDbLibraryReadPageSize";
import { getPhotoAssetMetadataPage } from "@/lib/clipstitchr/storage/getPhotoAssetMetadataPage";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

export async function getPhotoAssets() {
  const photos: PhotoAssetMetadata[] = [];
  let offset = 0;

  while (true) {
    const page = await getPhotoAssetMetadataPage({
      offset,
      limit: indexedDbLibraryReadPageSize,
    });

    photos.push(...page);

    if (page.length < indexedDbLibraryReadPageSize) {
      return photos;
    }

    offset += page.length;
  }
}
