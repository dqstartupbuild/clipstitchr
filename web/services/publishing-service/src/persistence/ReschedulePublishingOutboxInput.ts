export type ReschedulePublishingOutboxInput = Readonly<{
  outboxId: string;
  leaseOwner: string;
  availableAt: Date;
  safeErrorCode: string;
  rescheduledAt: Date;
}>;
