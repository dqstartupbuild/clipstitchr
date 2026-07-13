import type { AppAdHookGradeDimension } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGradeDimension";
import type { AppAdHookGraderInput } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGraderInput";
import { getPublicHookTokenOverlap } from "@/lib/clipstitchr/tools/publicHooks/getPublicHookTokenOverlap";

export function scoreAppAdHookVisualBridge({
  desiredOutcome,
  firstVisual,
  hook,
}: AppAdHookGraderInput): AppAdHookGradeDimension {
  const hasVisual = Boolean(firstVisual.trim());
  let score = hasVisual ? 45 : 55;

  if (/\b(?:look|see|show|watch)\b/i.test(hook)) score += 15;
  if (hasVisual && getPublicHookTokenOverlap(hook, firstVisual) > 0) score += 25;
  if (hasVisual && getPublicHookTokenOverlap(desiredOutcome, firstVisual) > 0) {
    score += 15;
  }
  if (!hasVisual && /\b(?:it|that|this)\b/i.test(hook)) score -= 25;

  const boundedScore = Math.max(0, Math.min(100, score));

  return {
    key: "visual-bridge",
    label: "Visual bridge",
    reason:
      boundedScore >= 75
        ? "The opening words and first visual can hand off without a missing step."
        : hasVisual
          ? "Make the first visual answer or deepen the exact tension in the hook."
          : "Add the first visual so you can check whether the words have a real payoff.",
    score: boundedScore,
  };
}
