export type ReadPublishingDestinationForDispatchInput = Readonly<{
  outboxId: string;
  leaseOwner: string;
  now: Date;
}>;
