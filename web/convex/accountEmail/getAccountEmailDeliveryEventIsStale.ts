import type { Doc } from "../_generated/dataModel";

const accountEmailDeliveryRank = {
  notApplicable: 0,
  pending: 0,
  delivered: 1,
  bounced: 2,
  complained: 3,
} as const;

export function getAccountEmailDeliveryEventIsStale(
  operation: Doc<"accountEmailOperations">,
  eventAt: number,
  incomingStatus: Doc<"accountEmailOperations">["deliveryStatus"],
) {
  return (
    operation.deliveryChangedAt !== undefined &&
    (operation.deliveryChangedAt > eventAt ||
      (operation.deliveryChangedAt === eventAt &&
        accountEmailDeliveryRank[operation.deliveryStatus] >
          accountEmailDeliveryRank[incomingStatus]))
  );
}
