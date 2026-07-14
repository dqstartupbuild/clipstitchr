import type { Doc } from "../_generated/dataModel";

const deliveryRank: Record<
  Doc<"emailProviderOperations">["deliveryStatus"],
  number
> = {
  notApplicable: 0,
  pending: 0,
  delivered: 1,
  bounced: 2,
  complained: 3,
};

export function getEmailDeliveryEventIsStale(
  operation: Doc<"emailProviderOperations">,
  eventAt: number,
  incomingStatus: Doc<"emailProviderOperations">["deliveryStatus"],
) {
  return (
    operation.deliveryChangedAt !== undefined &&
    (operation.deliveryChangedAt > eventAt ||
      (operation.deliveryChangedAt === eventAt &&
        deliveryRank[operation.deliveryStatus] >
          deliveryRank[incomingStatus]))
  );
}
