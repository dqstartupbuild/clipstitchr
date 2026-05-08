import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import { getAssetSearchText } from "@/lib/clipstitchr/utils/getAssetSearchText";

export function filterPhotosBySearchQuery(
  photos: PhotoAssetMetadata[],
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
