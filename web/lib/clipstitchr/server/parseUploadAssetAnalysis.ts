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
      name?: unknown;
      tags?: unknown;
    };
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
