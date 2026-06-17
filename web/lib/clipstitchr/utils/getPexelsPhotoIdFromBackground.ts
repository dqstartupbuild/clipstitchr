import { getPexelsPhotoIdFromUrl } from "@/lib/clipstitchr/utils/getPexelsPhotoIdFromUrl";

type PexelsBackgroundSource = {
  details?: string;
  pexelsPhotoId?: number;
};

export function getPexelsPhotoIdFromBackground(
  background: PexelsBackgroundSource,
) {
  if (background.pexelsPhotoId) {
    return background.pexelsPhotoId;
  }

  const pexelsPhotoLine = background.details
    ?.split("\n")
    .find((line) => line.trim().startsWith("Pexels photo:"));

  return getPexelsPhotoIdFromUrl(pexelsPhotoLine);
}
