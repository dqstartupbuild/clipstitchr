import type { PhotoAsset } from "@/lib/clipr/types/PhotoAsset";

export function filterPhotosByName(photos: PhotoAsset[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return photos;
  }

  return photos.filter((photo) =>
    photo.name.toLowerCase().includes(normalizedQuery),
  );
}
