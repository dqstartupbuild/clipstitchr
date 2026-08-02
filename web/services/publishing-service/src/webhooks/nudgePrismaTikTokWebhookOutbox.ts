import type { PrismaClient } from "@prisma/client";

import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import { assertPublishingPersistenceIdentifier } from "../persistence/assertPublishingPersistenceIdentifier.js";
import type { TikTokWebhookAttempt } from "./TikTokWebhookAttempt.js";

export const nudgePrismaTikTokWebhookOutbox = async (
  database: PrismaClient,
  attempt: TikTokWebhookAttempt,
  nudgedAt: Date,
): Promise<void> => {
  assertPublishingPersistenceIdentifier(attempt.attemptId, "attemptId");
  assertPublishingPersistenceIdentifier(attempt.postStateId, "postStateId");
  assertPublishingPersistenceIdentifier(attempt.tenantId, "tenantId");
  if (!Number.isSafeInteger(nudgedAt.getTime())) {
    throw new PublishingPersistenceValidationError("nudgedAt");
  }

  await database.clipPublishingOutbox.updateMany({
    where: {
      availableAt: { gt: nudgedAt },
      eventType: "publishing.destination.requested",
      eventVersion: 1,
      postStateId: attempt.postStateId,
      status: "PENDING",
      tenantId: attempt.tenantId,
    },
    data: { availableAt: nudgedAt },
  });
};
