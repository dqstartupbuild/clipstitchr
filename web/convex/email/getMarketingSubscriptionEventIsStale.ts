import type { Doc } from "../_generated/dataModel";

const subscriptionRank: Record<
  Doc<"marketingContacts">["subscriptionStatus"],
  number
> = {
  notSubscribed: 0,
  subscribed: 0,
  unsubscribed: 1,
};

export function getMarketingSubscriptionEventIsStale(
  contact: Doc<"marketingContacts">,
  eventAt: number,
  incomingStatus: "subscribed" | "unsubscribed",
) {
  return (
    contact.subscriptionChangedAt !== undefined &&
    (contact.subscriptionChangedAt > eventAt ||
      (contact.subscriptionChangedAt === eventAt &&
        subscriptionRank[contact.subscriptionStatus] >
          subscriptionRank[incomingStatus]))
  );
}
