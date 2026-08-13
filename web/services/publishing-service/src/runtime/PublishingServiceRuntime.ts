export type PublishingServiceRuntime = Readonly<{
  leaseOwner: string;
  outboxLoop: Promise<void>;
  stop: () => Promise<void>;
}>;
