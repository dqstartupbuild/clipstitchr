import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import { getAssetSearchText } from "@/lib/clipstitchr/utils/getAssetSearchText";

export function filterPhotosBySearchQuery(
  photos: PhotoAsset[],
  searchQuery: string,
) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  if (!normalizedSearchQuery) {
    return photos;
  }

  return photos.filter((photo) =>
    getAssetSearchText({
      ...photo,
      tags: ["photo", ...(photo.tags ?? [])],
    }).includes(normalizedSearchQuery),
  );
}
