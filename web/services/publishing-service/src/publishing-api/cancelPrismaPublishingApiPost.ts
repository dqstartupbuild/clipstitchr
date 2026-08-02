import type { PrismaClient } from "@prisma/client";

import type { ClerkTenantIdentity } from "../identity/ClerkTenantIdentity.js";
import { acquirePublishingAdvisoryLock } from "../persistence/acquirePublishingAdvisoryLock.js";
import { findPublishingTenantOrThrow } from "../persistence/findPublishingTenantOrThrow.js";
import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import { PublishingApiConflictError } from "./PublishingApiConflictError.js";
import { isPublishingApiPostCancelable } from "./isPublishingApiPostCancelable.js";
import { publishingApiPostStateInclude } from "./publishingApiPostStateInclude.js";
import { readPrismaPublishingApiPost } from "./readPrismaPublishingApiPost.js";

export const cancelPrismaPublishingApiPost = async (
  database: PrismaClient,
  identity: ClerkTenantIdentity,
  requestId: string,
  postId: string,
  now: Date,
) => {
  await database.$transaction(async (transaction) => {
    const tenant = await findPublishingTenantOrThrow(
      transaction as never,
      identity.tenantKey,
    );
    await acquirePublishingAdvisoryLock(
      transaction,
      `publishing-api:post:${tenant.id}:${postId}`,
    );
    const record = await transaction.clipPublishingPostState.findFirst({
      where: { tenantId: tenant.id, postId, post: { deletedAt: null } },
      include: publishingApiPostStateInclude,
    });
    if (record === null) {
      throw new PublishingResourceOwnershipError();
    }
    if (!isPublishingApiPostCancelable(record)) {
      throw new PublishingApiConflictError("post_not_cancelable");
    }
    const attempt = record.attempts[0]!;
    const outbox = record.outboxEvents.find(
      (event) =>
        event.status === "PENDING" &&
        event.leaseOwner === null &&
        event.leaseExpiresAt === null &&
        event.deliveredAt === null,
    )!;
    const outboxUpdate = await transaction.clipPublishingOutbox.updateMany({
      where: {
        id: outbox.id,
        postStateId: record.id,
        status: "PENDING",
        leaseOwner: null,
        leaseExpiresAt: null,
        deliveredAt: null,
      },
      data: {
        status: "DEAD_LETTER",
        lastSafeError: "canceled_before_dispatch",
      },
    });
    const attemptUpdate = await transaction.clipPublishingAttempt.updateMany({
      where: {
        id: attempt.id,
        postStateId: record.id,
        status: "INTENT",
        providerOperationId: null,
      },
      data: { status: "CANCELED", finishedAt: now },
    });
    if (outboxUpdate.count !== 1 || attemptUpdate.count !== 1) {
      throw new PublishingApiConflictError("post_not_cancelable");
    }
    await transaction.clipPublishingPostState.update({
      where: { id: record.id },
      data: {
        disposition: "CANCELED",
        internalState: "CANCELED",
        canceledAt: now,
      },
    });
    await transaction.post.update({
      where: { id: record.postId },
      data: { state: "ERROR", error: null },
    });
    await transaction.clipPublishingAuditEvent.create({
      data: {
        tenantId: tenant.id,
        actorClerkUserId: identity.actorUserId,
        requestId,
        action: "publishing.destination.cancel",
        subjectType: "post",
        subjectId: record.postId,
        result: "canceled",
        safeMetadata: { schemaVersion: 1 },
      },
    });
  });
  return readPrismaPublishingApiPost(database, identity.tenantKey, postId);
};
