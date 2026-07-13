import type { AppAdHookGradeDimension } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGradeDimension";

const fixes: Record<AppAdHookGradeDimension["key"], string> = {
  "audience-fit": "Use a situation or phrase the intended viewer recognizes immediately.",
  "claim-safety": "Replace unsupported promises with a line the footage can honestly prove.",
  clarity: "Keep one complete thought and remove wording that needs extra setup.",
  curiosity: "Open one specific question that the next shot can answer.",
  specificity: "Name a real audience, friction point, action, or desired outcome.",
  "visual-bridge": "Make the first visual answer the hook instead of starting a new idea.",
};

export function getAppAdHookGraderFix(
  dimension: AppAdHookGradeDimension,
) {
  return fixes[dimension.key];
}
