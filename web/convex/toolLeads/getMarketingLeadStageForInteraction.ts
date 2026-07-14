import type { Doc } from "../_generated/dataModel";

export function getMarketingLeadStageForInteraction(
  interactionType: Doc<"toolLeadInteractions">["interactionType"],
) {
  if (interactionType === "paidCtaClicked") {
    return "product-interested" as const;
  }
  if (interactionType === "resourceUnlocked") {
    return "high-intent" as const;
  }

  return "engaged" as const;
}
