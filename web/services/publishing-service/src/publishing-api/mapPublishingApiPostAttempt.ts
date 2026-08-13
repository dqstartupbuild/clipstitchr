import type { PublishingApiPostAttempt } from "./PublishingApiPostAttempt.js";
import type { PublishingApiPostStateRecord } from "./publishingApiPostStateInclude.js";
import { readPublishingApiSafeMessage } from "./readPublishingApiSafeMessage.js";

const STATUS = Object.freeze({
  INTENT: "intent",
  STARTED: "started",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  UNCERTAIN: "uncertain",
  CANCELED: "canceled",
} as const);

export const mapPublishingApiPostAttempt = (
  attempt: PublishingApiPostStateRecord["attempts"][number],
): PublishingApiPostAttempt =>
  Object.freeze({
    finishedAt: attempt.finishedAt?.toISOString() ?? null,
    id: attempt.id,
    message: readPublishingApiSafeMessage(attempt.safeErrorMessage),
    number: attempt.attemptNumber,
    startedAt: attempt.startedAt?.toISOString() ?? null,
    status: STATUS[attempt.status],
  });
