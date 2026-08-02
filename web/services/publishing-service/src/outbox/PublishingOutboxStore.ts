import type { LeasedPublishingOutboxRecord } from "../persistence/LeasedPublishingOutboxRecord.js";

export type PublishingOutboxStore = Readonly<{
  lease: (input: {
    leaseOwner: string;
    limit: number;
    leaseDurationMilliseconds: number;
    now: Date;
  }) => Promise<readonly LeasedPublishingOutboxRecord[]>;
  markDelivered: (input: {
    outboxId: string;
    leaseOwner: string;
    deliveredAt: Date;
  }) => Promise<void>;
  reschedule: (input: {
    outboxId: string;
    leaseOwner: string;
    availableAt: Date;
    safeErrorCode: string;
    rescheduledAt: Date;
  }) => Promise<void>;
  markDeadLetter: (input: {
    outboxId: string;
    leaseOwner: string;
    safeErrorCode: string;
    deadLetteredAt: Date;
  }) => Promise<void>;
}>;
