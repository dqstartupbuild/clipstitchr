export type LeasePublishingOutboxInput = Readonly<{
  leaseOwner: string;
  now: Date;
  leaseDurationMilliseconds: number;
  limit: number;
}>;
