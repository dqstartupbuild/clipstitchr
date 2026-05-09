import type { UploadAssetAnalysis } from "@/lib/clipstitchr/types/UploadAssetAnalysis";
import { getUploadFallbackName } from "@/lib/clipstitchr/utils/getUploadFallbackName";
import { normalizeAssetTags } from "@/lib/clipstitchr/utils/normalizeAssetTags";

export function parseUploadAssetAnalysis(
  text: string,
  originalName: string,
): UploadAssetAnalysis {
  const fallbackName = getUploadFallbackName(originalName);
  const jsonText = text.match(/\{[\s\S]*\}/)?.[0] ?? "";

  if (!jsonText) {
    return {
      name: fallbackName,
      tags: [],
    };
  }

  try {
    const parsed = JSON.parse(jsonText) as {
      avatarDescription?: unknown;
      outfitDescription?: unknown;
      locationDescription?: unknown;
      name?: unknown;
      tags?: unknown;
    };
    const avatarDescription =
      typeof parsed.avatarDescription === "string"
        ? parsed.avatarDescription.trim().slice(0, 1200)
        : undefined;
    const outfitDescription =
      typeof parsed.outfitDescription === "string"
        ? parsed.outfitDescription.trim().slice(0, 800)
        : undefined;
    const locationDescription =
      typeof parsed.locationDescription === "string"
        ? parsed.locationDescription.trim().slice(0, 800)
        : undefined;
    const name =
      typeof parsed.name === "string" && parsed.name.trim()
        ? parsed.name.trim().slice(0, 80)
        : fallbackName;
    const tags = Array.isArray(parsed.tags)
      ? normalizeAssetTags(
          parsed.tags.filter((tag): tag is string => typeof tag === "string"),
        )
      : [];

    return {
      ...(avatarDescription ? { avatarDescription } : {}),
      ...(outfitDescription ? { outfitDescription } : {}),
      ...(locationDescription ? { locationDescription } : {}),
      name,
      tags,
    };
  } catch {
    return {
      name: fallbackName,
      tags: [],
    };
  }
}
