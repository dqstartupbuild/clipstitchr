import type { Doc } from "../_generated/dataModel";

const marketingLeadStageRanks = {
  captured: 0,
  engaged: 1,
  "high-intent": 2,
  "product-interested": 3,
  converted: 4,
} as const;

export function getMarketingLeadStageWithAdvance(
  current: Doc<"marketingContacts">["leadStage"],
  next: Doc<"marketingContacts">["leadStage"],
) {
  return marketingLeadStageRanks[next] > marketingLeadStageRanks[current]
    ? next
    : current;
}
