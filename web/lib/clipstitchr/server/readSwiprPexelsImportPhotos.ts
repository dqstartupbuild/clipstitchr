import { SWIPR_PEXELS_IMPORT_LIMIT } from "@/lib/clipstitchr/constants/swiprPexelsImportLimit";
import { readPexelsPhotoResult } from "@/lib/clipstitchr/server/pexels/readPexelsPhotoResult";
import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";

export function readSwiprPexelsImportPhotos(
  value: unknown,
): PexelsPhotoResult[] | null {
  if (value === undefined) {
    return null;
  }

  if (!Array.isArray(value)) {
    throw new Error("Choose Pexels photos to import first.");
  }

  if (value.length > SWIPR_PEXELS_IMPORT_LIMIT) {
    throw new Error(
      `You can import up to ${SWIPR_PEXELS_IMPORT_LIMIT} loaded photos at a time.`,
    );
  }

  const photosById = new Map<number, PexelsPhotoResult>();

  for (const entry of value) {
    const photo = readPexelsPhotoResult(entry);

    if (photo) {
      photosById.set(photo.id, photo);
    }
  }

  if (!photosById.size) {
    throw new Error("Choose Pexels photos to import first.");
  }

  return [...photosById.values()];
}
