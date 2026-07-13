import type { AppAdHookGradeDimension } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGradeDimension";
import type { AppAdHookGraderInput } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGraderInput";

export function scoreAppAdHookCuriosity({
  firstVisual,
  hook,
}: AppAdHookGraderInput): AppAdHookGradeDimension {
  let score = 35;

  if (hook.includes("?")) score += 25;
  if (/\b(?:how|most people miss|the part|what|why)\b/i.test(hook)) score += 20;
  if (/\b(?:before|but|still|until|without)\b/i.test(hook)) score += 20;
  if (!firstVisual.trim() && /\b(?:it|that|this)\b/i.test(hook)) score -= 20;

  const boundedScore = Math.max(0, Math.min(100, score));

  return {
    key: "curiosity",
    label: "Curiosity",
    reason:
      boundedScore >= 75
        ? "The line creates a clear question or tension the next moment can answer."
        : "Open one useful question without hiding the whole point behind vague hype.",
    score: boundedScore,
  };
}
