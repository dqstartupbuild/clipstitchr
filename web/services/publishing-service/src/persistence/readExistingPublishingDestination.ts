import type { PrismaClient } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import type { ExistingPublishingDestination } from "./ExistingPublishingDestination.js";
import { mapPublishingDestinationIntentKind } from "./mapPublishingDestinationIntentKind.js";

export const readExistingPublishingDestination = async (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  productId: string,
  integrationId: string,
  idempotencyKey: string,
): Promise<ExistingPublishingDestination | null> => {
  const state = await database.clipPublishingPostState.findFirst({
    where: {
      tenant: { tenantKey },
      productId,
      integrationId,
      idempotencyKey,
    },
    include: {
      post: true,
      attempts: {
        orderBy: { attemptNumber: "asc" },
        take: 1,
      },
      outboxEvents: {
        where: {
          eventType: "publishing.destination.requested",
          eventVersion: 1,
        },
        take: 1,
      },
    },
  });

  if (state === null) {
    return null;
  }

  const attempt = state.attempts[0];
  const outbox = state.outboxEvents[0];
  const isDraft = state.intent === "DRAFT";

  if (
    (isDraft && (attempt !== undefined || outbox !== undefined)) ||
    (!isDraft && (attempt === undefined || outbox === undefined))
  ) {
    throw new PublishingPersistenceValidationError("destinationInvariant");
  }

  return {
    postId: state.postId,
    postStateId: state.id,
    attemptId: attempt?.id ?? null,
    outboxId: outbox?.id ?? null,
    workflowId: state.workflowId,
    canonicalRequestHash: state.canonicalRequestHash,
    publishDate: state.post.publishDate,
    intent: mapPublishingDestinationIntentKind(state.intent),
    scheduledTimeZone: state.scheduledTimeZone,
    scheduledLocalTime: state.scheduledLocalTime,
    scheduledUtcOffsetMinutes: state.scheduledUtcOffsetMinutes,
  };
};
