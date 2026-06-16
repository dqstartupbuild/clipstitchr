import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function parsePexelsPhotoResult(
  value: unknown,
): PexelsPhotoResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const photo = value as Record<string, unknown>;
  const src =
    photo.src && typeof photo.src === "object" && !Array.isArray(photo.src)
      ? (photo.src as Record<string, unknown>)
      : {};
  const id = getNumber(photo.id);
  const portrait = getString(src.portrait);
  const large = getString(src.large);

  if (!id || (!portrait && !large)) {
    return null;
  }

  return {
    id,
    alt: getString(photo.alt),
    photographer: getString(photo.photographer),
    photographerUrl: getString(photo.photographer_url),
    pexelsUrl: getString(photo.url),
    width: getNumber(photo.width),
    height: getNumber(photo.height),
    src: {
      large,
      large2x: getString(src.large2x),
      medium: getString(src.medium),
      original: getString(src.original),
      portrait,
      small: getString(src.small),
    },
  };
}
