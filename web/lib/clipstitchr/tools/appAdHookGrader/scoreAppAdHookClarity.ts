import type { AppAdHookGradeDimension } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGradeDimension";
import type { AppAdHookGraderInput } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGraderInput";
import { normalizePublicHookText } from "@/lib/clipstitchr/tools/publicHooks/normalizePublicHookText";

export function scoreAppAdHookClarity({
  firstVisual,
  hook,
}: AppAdHookGraderInput): AppAdHookGradeDimension {
  const normalizedHook = normalizePublicHookText(hook);
  const wordCount = normalizedHook.split(" ").filter(Boolean).length;
  let score = 100;

  if (wordCount < 3) score -= 30;
  if (wordCount > 14) score -= 25;
  if (wordCount > 20) score -= 20;
  if (normalizedHook.length > 100) score -= 20;
  if (/\{\{|\}\}|\[[^\]]+\]/.test(normalizedHook)) score -= 40;
  if (/([!?])\1+/.test(normalizedHook)) score -= 10;
  if (
    normalizedHook.length > 5 &&
    normalizedHook === normalizedHook.toUpperCase()
  ) {
    score -= 15;
  }
  if (!firstVisual.trim() && /\b(?:it|that|this)\b/i.test(normalizedHook)) {
    score -= 15;
  }

  const boundedScore = Math.max(0, Math.min(100, score));

  return {
    key: "clarity",
    label: "Clarity",
    reason:
      boundedScore >= 80
        ? "The opening is compact and understandable without much setup."
        : "Shorten the line or replace wording that depends on missing context.",
    score: boundedScore,
  };
}
