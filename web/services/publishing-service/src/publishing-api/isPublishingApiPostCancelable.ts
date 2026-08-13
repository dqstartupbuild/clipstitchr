import type { PublishingApiPostStateRecord } from "./publishingApiPostStateInclude.js";

export const isPublishingApiPostCancelable = (
  record: PublishingApiPostStateRecord,
): boolean =>
  record.disposition === "ACTIVE" &&
  record.internalState === "QUEUED" &&
  record.post.state === "QUEUE" &&
  record.attempts[0]?.status === "INTENT" &&
  record.attempts[0].providerOperationId === null &&
  record.outboxEvents.some(
    (event) =>
      event.status === "PENDING" &&
      event.leaseOwner === null &&
      event.leaseExpiresAt === null &&
      event.deliveredAt === null,
  );
