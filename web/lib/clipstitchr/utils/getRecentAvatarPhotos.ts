import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

export function getRecentAvatarPhotos(
  photos: PhotoAssetMetadata[],
  limit: number,
) {
  const latestPhotosByAvatarId = new Map<string, PhotoAssetMetadata>();

  for (const photo of photos) {
    if (!photo.avatarId) {
      continue;
    }

    const currentPhoto = latestPhotosByAvatarId.get(photo.avatarId);

    if (
      !currentPhoto ||
      new Date(photo.createdAt).getTime() >
        new Date(currentPhoto.createdAt).getTime()
    ) {
      latestPhotosByAvatarId.set(photo.avatarId, photo);
    }
  }

  return [...latestPhotosByAvatarId.values()]
    .sort(
      (firstPhoto, secondPhoto) =>
        new Date(secondPhoto.createdAt).getTime() -
        new Date(firstPhoto.createdAt).getTime(),
    )
    .slice(0, limit);
}
