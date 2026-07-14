import type { Doc } from "../_generated/dataModel";

const suppressionRank: Record<
  Doc<"marketingContacts">["suppressionStatus"],
  number
> = {
  none: 0,
  hardBounce: 1,
  complaint: 2,
  providerSuppressed: 2,
};

export function getMarketingSuppressionEventIsStale(
  contact: Doc<"marketingContacts">,
  eventAt: number,
  incomingStatus: Doc<"marketingContacts">["suppressionStatus"],
) {
  return (
    contact.suppressionChangedAt !== undefined &&
    (contact.suppressionChangedAt > eventAt ||
      (contact.suppressionChangedAt === eventAt &&
        suppressionRank[contact.suppressionStatus] >
          suppressionRank[incomingStatus]))
  );
}
