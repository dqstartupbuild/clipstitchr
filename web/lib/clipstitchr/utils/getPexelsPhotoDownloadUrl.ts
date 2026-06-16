import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";

export function getPexelsPhotoDownloadUrl(photo: PexelsPhotoResult) {
  return (
    photo.src.portrait ||
    photo.src.large2x ||
    photo.src.large ||
    photo.src.original ||
    photo.src.medium
  );
}
