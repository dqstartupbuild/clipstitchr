import type { PublishingApiPostStateRecord } from "./publishingApiPostStateInclude.js";

const UNSAFE_RESULTS = new Set([
  "PUBLISHED",
  "ACCEPTED_PROCESSING",
  "USER_ACTION_REQUIRED",
  "UNCERTAIN",
]);

export const isPublishingApiPostRetryable = (
  record: PublishingApiPostStateRecord,
): boolean =>
  record.disposition === "TERMINAL" &&
  record.internalState === "FAILED" &&
  record.post.state === "ERROR" &&
  record.attempts[0]?.status === "FAILED" &&
  record.attempts[0].finishedAt !== null &&
  record.receipts.some(({ resultClass }) => resultClass === "REJECTED") &&
  !record.receipts.some(({ resultClass }) => UNSAFE_RESULTS.has(resultClass)) &&
  !record.receipts.some(({ publications }) => publications.length > 0) &&
  !record.attempts.some(({ providerOperationId }) => providerOperationId !== null) &&
  !record.outboxEvents.some(
    ({ status }) => status === "PENDING" || status === "LEASED",
  );
