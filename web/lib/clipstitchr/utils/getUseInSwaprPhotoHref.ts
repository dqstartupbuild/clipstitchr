import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

export function getUseInSwaprPhotoHref(photo: PhotoAssetMetadata) {
  return `/dashboard/swapr?photoId=${encodeURIComponent(photo.id)}`;
}
