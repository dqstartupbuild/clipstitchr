import type { AppAdShotListInput } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListInput";

export function getAppAdOpeningDirection(input: AppAdShotListInput) {
  switch (input.openingAngle) {
    case "audience-callout":
      return `Make ${input.audience.trim()} recognize themselves before showing the product.`;
    case "outcome-first":
      return `Lead with the desire to ${input.desiredOutcome.trim()}, without promising a guaranteed result.`;
    case "demo-first":
      return `Open on the visible action: ${input.productMoment.trim()}.`;
    default:
      return `Make the before-moment recognizable: ${input.problem.trim()}.`;
  }
}
