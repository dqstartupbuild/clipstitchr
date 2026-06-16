import { parsePexelsPhotoResult } from "@/lib/clipstitchr/server/pexels/parsePexelsPhotoResult";
import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";

export function parsePexelsSearchResponse(value: unknown): PexelsPhotoResult[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  const photos = (value as Record<string, unknown>).photos;

  if (!Array.isArray(photos)) {
    return [];
  }

  return photos.flatMap((photo) => {
    const result = parsePexelsPhotoResult(photo);

    return result ? [result] : [];
  });
}
