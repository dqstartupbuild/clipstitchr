import type { SwiprBackgroundAnalysis } from "@/lib/clipstitchr/types/SwiprBackgroundAnalysis";
import { getUploadFallbackName } from "@/lib/clipstitchr/utils/getUploadFallbackName";
import { normalizeAssetTags } from "@/lib/clipstitchr/utils/normalizeAssetTags";

export function parseSwiprBackgroundAnalysis(
  text: string,
  originalName: string,
): SwiprBackgroundAnalysis {
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
      description?: unknown;
      details?: unknown;
      name?: unknown;
      tags?: unknown;
    };
    const name =
      typeof parsed.name === "string" && parsed.name.trim()
        ? parsed.name.trim().slice(0, 120)
        : fallbackName;
    const tags = Array.isArray(parsed.tags)
      ? normalizeAssetTags(
          parsed.tags.filter((tag): tag is string => typeof tag === "string"),
        )
      : [];
    const description =
      typeof parsed.description === "string"
        ? parsed.description.trim().slice(0, 1200)
        : undefined;
    const details =
      typeof parsed.details === "string"
        ? parsed.details.trim().slice(0, 3000)
        : undefined;

    return {
      name,
      tags,
      ...(description ? { description } : {}),
      ...(details ? { details } : {}),
    };
  } catch {
    return {
      name: fallbackName,
      tags: [],
    };
  }
}
