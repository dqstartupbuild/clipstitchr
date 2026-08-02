import { PublishingIdempotencyConflictError } from "../errors/PublishingIdempotencyConflictError.js";
import type { ExistingPublishingDestination } from "./ExistingPublishingDestination.js";
import type { PublishingDestinationCreationResult } from "./PublishingDestinationCreationResult.js";

export const mapExistingPublishingDestinationResult = (
  existing: ExistingPublishingDestination,
  canonicalRequestHash: string,
  created: boolean,
): PublishingDestinationCreationResult => {
  if (existing.canonicalRequestHash !== canonicalRequestHash) {
    throw new PublishingIdempotencyConflictError();
  }

  return {
    created,
    postId: existing.postId,
    postStateId: existing.postStateId,
    attemptId: existing.attemptId,
    outboxId: existing.outboxId,
    workflowId: existing.workflowId,
    canonicalRequestHash: existing.canonicalRequestHash,
    publishDate: existing.publishDate,
    intent: existing.intent,
    scheduledTimeZone: existing.scheduledTimeZone,
    scheduledLocalTime: existing.scheduledLocalTime,
    scheduledUtcOffsetMinutes: existing.scheduledUtcOffsetMinutes,
  };
};
