import type { Doc } from "../_generated/dataModel";

export function getMarketingMailingListEventIsStale(
  membership: Doc<"marketingMailingListMemberships">,
  eventAt: number,
  incomingStatus: Doc<"marketingMailingListMemberships">["status"],
) {
  return (
    membership.eventAt > eventAt ||
    (membership.eventAt === eventAt &&
      membership.status === "unsubscribed" &&
      incomingStatus === "subscribed")
  );
}
