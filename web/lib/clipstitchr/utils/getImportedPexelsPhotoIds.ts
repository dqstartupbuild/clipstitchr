import { getPexelsPhotoIdFromBackground } from "@/lib/clipstitchr/utils/getPexelsPhotoIdFromBackground";

type ImportedPexelsBackground = {
  details?: string;
  pexelsPhotoId?: number;
  source?: string;
};

export function getImportedPexelsPhotoIds(
  backgrounds: ImportedPexelsBackground[],
) {
  const ids = new Set<number>();

  for (const background of backgrounds) {
    if (background.source !== "pexels") {
      continue;
    }

    const photoId = getPexelsPhotoIdFromBackground(background);

    if (photoId) {
      ids.add(photoId);
    }
  }

  return ids;
}
