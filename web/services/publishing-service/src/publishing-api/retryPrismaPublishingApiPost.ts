import type { PrismaClient } from "@prisma/client";

import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { ClerkTenantIdentity } from "../identity/ClerkTenantIdentity.js";
import { acquirePublishingAdvisoryLock } from "../persistence/acquirePublishingAdvisoryLock.js";
import { findPublishingTenantOrThrow } from "../persistence/findPublishingTenantOrThrow.js";
import { PublishingApiConflictError } from "./PublishingApiConflictError.js";
import { publishingApiPostStateInclude } from "./publishingApiPostStateInclude.js";
import { readPrismaPublishingApiPost } from "./readPrismaPublishingApiPost.js";

export const retryPrismaPublishingApiPost = async (
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
    const latestAttempt = await transaction.clipPublishingAttempt.findFirst({
      where: { tenantId: tenant.id, postStateId: record.id },
      orderBy: [{ attemptNumber: "desc" }, { id: "desc" }],
    });
    const [unsafeReceipts, rejectedReceipts, publications, providerOperations, activeOutbox] =
      await Promise.all([
        transaction.clipPublishingReceipt.count({
          where: {
            tenantId: tenant.id,
            postStateId: record.id,
            resultClass: {
              in: [
                "PUBLISHED",
                "ACCEPTED_PROCESSING",
                "USER_ACTION_REQUIRED",
                "UNCERTAIN",
              ],
            },
          },
        }),
        transaction.clipPublishingReceipt.count({
          where: {
            tenantId: tenant.id,
            postStateId: record.id,
            resultClass: "REJECTED",
          },
        }),
        transaction.clipPublishingReceiptPublication.count({
          where: {
            tenantId: tenant.id,
            receipt: { postStateId: record.id },
          },
        }),
        transaction.clipPublishingAttempt.count({
          where: {
            tenantId: tenant.id,
            postStateId: record.id,
            providerOperationId: { not: null },
          },
        }),
        transaction.clipPublishingOutbox.count({
          where: {
            tenantId: tenant.id,
            postStateId: record.id,
            status: { in: ["PENDING", "LEASED"] },
          },
        }),
      ]);
    if (
      record.disposition !== "TERMINAL" ||
      record.internalState !== "FAILED" ||
      record.post.state !== "ERROR" ||
      latestAttempt?.status !== "FAILED" ||
      latestAttempt.finishedAt === null ||
      rejectedReceipts < 1 ||
      unsafeReceipts !== 0 ||
      publications !== 0 ||
      providerOperations !== 0 ||
      activeOutbox !== 0 ||
      latestAttempt.attemptNumber >= 2_147_483_647
    ) {
      throw new PublishingApiConflictError("post_not_retryable");
    }
    const attemptNumber = latestAttempt.attemptNumber + 1;
    await transaction.clipPublishingAttempt.create({
      data: {
        tenantId: tenant.id,
        postStateId: record.id,
        attemptNumber,
        actorClerkUserId: identity.actorUserId,
      },
    });
    await transaction.clipPublishingOutbox.create({
      data: {
        tenantId: tenant.id,
        postStateId: record.id,
        workflowId: record.workflowId,
        eventType: "publishing.destination.requested",
        eventVersion: attemptNumber,
        availableAt: now,
        payload: {
          schemaVersion: 1,
          tenantId: tenant.id,
          postId: record.postId,
          postStateId: record.id,
          integrationId: record.integrationId,
          workflowId: record.workflowId,
          intent:
            record.intent === "SCHEDULE"
              ? "schedule"
              : record.intent === "PUBLISH_NOW"
                ? "publish-now"
                : "draft",
        },
      },
    });
    await transaction.clipPublishingPostState.update({
      where: { id: record.id },
      data: {
        disposition: "ACTIVE",
        internalState: "QUEUED",
        canceledAt: null,
        workflowRunId: null,
      },
    });
    await transaction.post.update({
      where: { id: record.postId },
      data: { state: "QUEUE", publishDate: now, error: null },
    });
    await transaction.clipPublishingAuditEvent.create({
      data: {
        tenantId: tenant.id,
        actorClerkUserId: identity.actorUserId,
        requestId,
        action: "publishing.destination.retry",
        subjectType: "post",
        subjectId: record.postId,
        result: "queued",
        safeMetadata: { schemaVersion: 1, attemptNumber },
      },
    });
  });
  return readPrismaPublishingApiPost(database, identity.tenantKey, postId);
};
