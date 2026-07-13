import type { AppAdHookGradeDimension } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGradeDimension";
import type { AppAdHookGraderInput } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGraderInput";
import { getPublicHookTokenOverlap } from "@/lib/clipstitchr/tools/publicHooks/getPublicHookTokenOverlap";

export function scoreAppAdHookAudienceFit({
  audience,
  hook,
}: AppAdHookGraderInput): AppAdHookGradeDimension {
  const overlap = getPublicHookTokenOverlap(hook, audience);
  const speaksToViewer = /\b(?:you|your|you're|you’re)\b/i.test(hook);
  const score = Math.min(
    100,
    25 + (overlap > 0 ? 50 : 0) + (speaksToViewer ? 25 : 0),
  );

  return {
    key: "audience-fit",
    label: "Audience fit",
    reason:
      score >= 75
        ? "The intended viewer can quickly recognize that the line is for them."
        : "Use the audience's own situation or speak to the viewer more directly.",
    score,
  };
}
