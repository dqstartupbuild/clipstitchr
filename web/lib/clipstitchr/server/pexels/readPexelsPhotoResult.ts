import { getIsPexelsImageUrl } from "@/lib/clipstitchr/server/pexels/getIsPexelsImageUrl";
import { getIsPexelsPageUrl } from "@/lib/clipstitchr/server/pexels/getIsPexelsPageUrl";
import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readPexelsImageUrl(value: unknown) {
  const url = readString(value);

  return getIsPexelsImageUrl(url) ? url : "";
}

export function readPexelsPhotoResult(value: unknown): PexelsPhotoResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const photo = value as Record<string, unknown>;
  const src =
    photo.src && typeof photo.src === "object" && !Array.isArray(photo.src)
      ? (photo.src as Record<string, unknown>)
      : {};
  const id = readNumber(photo.id);
  const portrait = readPexelsImageUrl(src.portrait);
  const large = readPexelsImageUrl(src.large);
  const pexelsUrl = readString(photo.pexelsUrl);

  if (!id || (!portrait && !large) || !getIsPexelsPageUrl(pexelsUrl)) {
    return null;
  }

  return {
    id,
    alt: readString(photo.alt),
    photographer: readString(photo.photographer),
    photographerUrl: readString(photo.photographerUrl),
    pexelsUrl,
    width: readNumber(photo.width),
    height: readNumber(photo.height),
    src: {
      large,
      large2x: readPexelsImageUrl(src.large2x),
      medium: readPexelsImageUrl(src.medium),
      original: readPexelsImageUrl(src.original),
      portrait,
      small: readPexelsImageUrl(src.small),
    },
  };
}
