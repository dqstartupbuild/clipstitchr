import type { PexelsPhotoResult } from "@/lib/clipstitchr/types/PexelsPhotoResult";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

export function createSwiprPexelsBackgroundMetadata({
  photo,
  query,
}: {
  photo: PexelsPhotoResult;
  query: string;
}) {
  return {
    description: photo.alt || `Pexels photo by ${photo.photographer}`,
    details: [
      `Library query: ${query}`,
      `Pexels photo: ${photo.pexelsUrl}`,
      `Photographer: ${photo.photographer}`,
      photo.photographerUrl
        ? `Photographer URL: ${photo.photographerUrl}`
        : undefined,
      photo.alt ? `Alt text: ${photo.alt}` : undefined,
    ]
      .filter((detail): detail is string => Boolean(detail))
      .join("\n"),
    name: `Pexels - ${photo.photographer || query}`,
    tags: normalizeAssetTagsWithRequiredTag(
      [query, photo.alt, photo.photographer].filter(
        (tag): tag is string => Boolean(tag),
      ),
      "pexels",
    ),
  };
}
