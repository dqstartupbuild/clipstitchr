import type { AppAdHookGradeDimension } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGradeDimension";
import type { AppAdHookGraderInput } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGraderInput";
import { getPublicHookTokenOverlap } from "@/lib/clipstitchr/tools/publicHooks/getPublicHookTokenOverlap";

export function scoreAppAdHookSpecificity(
  input: AppAdHookGraderInput,
): AppAdHookGradeDimension {
  const overlaps = [input.appContext, input.audience, input.desiredOutcome].map(
    (context) => getPublicHookTokenOverlap(input.hook, context),
  );
  let score = 25 + overlaps.filter((overlap) => overlap > 0).length * 25;

  if (/\b(?:amazing|better results|game changer|level up|unlock)\b/i.test(input.hook)) {
    score -= 20;
  }

  const boundedScore = Math.max(0, Math.min(100, score));

  return {
    key: "specificity",
    label: "Specificity",
    reason:
      boundedScore >= 75
        ? "The hook connects to concrete app, audience, or outcome context."
        : "Name a recognizable audience, friction point, action, or outcome.",
    score: boundedScore,
  };
}
