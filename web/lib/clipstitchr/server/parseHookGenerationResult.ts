import { getJsonFromModelOutput } from "@/lib/clipstitchr/server/getJsonFromModelOutput";
import type { HookGenerationPurpose } from "@/lib/clipstitchr/types/HookGenerationPurpose";
import type { HookGenerationResult } from "@/lib/clipstitchr/types/HookGenerationResult";

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function parseHookGenerationResult({
  outputText,
  purpose,
  slideCount,
}: {
  outputText: string;
  purpose: HookGenerationPurpose;
  slideCount?: number;
}): HookGenerationResult {
  const parsed = JSON.parse(getJsonFromModelOutput(outputText)) as {
    slides?: unknown;
    text?: unknown;
  };

  if (purpose === "swipr-slides") {
    const slides = Array.isArray(parsed.slides)
      ? parsed.slides
          .map((slide) => normalizeText(slide, 96))
          .filter(Boolean)
          .slice(0, slideCount ?? 8)
      : [];

    if (slides.length !== slideCount) {
      throw new Error("Hook generation returned the wrong number of slides.");
    }

    return {
      purpose,
      slides,
    };
  }

  const text = normalizeText(parsed.text, 96);

  if (!text) {
    throw new Error("Hook generation returned empty text.");
  }

  return {
    purpose,
    text,
  };
}
