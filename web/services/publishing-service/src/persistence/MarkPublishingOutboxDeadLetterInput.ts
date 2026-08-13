export type MarkPublishingOutboxDeadLetterInput = Readonly<{
  outboxId: string;
  leaseOwner: string;
  safeErrorCode: string;
  deadLetteredAt: Date;
}>;
