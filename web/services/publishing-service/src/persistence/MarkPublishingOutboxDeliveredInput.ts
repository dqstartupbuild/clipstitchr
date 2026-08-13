export type MarkPublishingOutboxDeliveredInput = Readonly<{
  outboxId: string;
  leaseOwner: string;
  deliveredAt: Date;
}>;
