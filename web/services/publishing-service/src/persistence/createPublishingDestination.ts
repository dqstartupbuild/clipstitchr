import type { PrismaClient } from "@prisma/client";

import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { CreatePublishingDestinationInput } from "./CreatePublishingDestinationInput.js";
import { assertBoundedSafePersistenceJson } from "./assertBoundedSafePersistenceJson.js";
import { assertPublishingContent } from "./assertPublishingContent.js";
import { assertPublishingDisplayName } from "./assertPublishingDisplayName.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { createCanonicalPublishingRequestHash } from "./createCanonicalPublishingRequestHash.js";
import { createPublishingWorkflowId } from "./createPublishingWorkflowId.js";
import { findPublishingTenantOrThrow } from "./findPublishingTenantOrThrow.js";
import { isPrismaUniqueConstraintError } from "./isPrismaUniqueConstraintError.js";
import { mapExistingPublishingDestinationResult } from "./mapExistingPublishingDestinationResult.js";
import { readExistingPublishingDestination } from "./readExistingPublishingDestination.js";
import { resolvePublishingDestinationIntent } from "./resolvePublishingDestinationIntent.js";

export const createPublishingDestination = async (
  database: PrismaClient,
  input: CreatePublishingDestinationInput,
  now = new Date(),
) => {
  assertPublishingPersistenceIdentifier(input.integrationId, "integrationId");
  assertPublishingPersistenceIdentifier(input.productId, "productId");
  assertPublishingPersistenceIdentifier(input.mediaSourceId, "mediaSourceId");
  assertPublishingPersistenceIdentifier(input.idempotencyKey, "idempotencyKey");
  assertPublishingPersistenceIdentifier(
    input.actorClerkUserId,
    "actorClerkUserId",
  );
  assertPublishingPersistenceIdentifier(input.requestId, "requestId");
  assertPublishingPersistenceIdentifier(input.group, "group");
  assertPublishingContent(input.content);
  assertBoundedSafePersistenceJson(
    input.destinationSettings,
    "destinationSettings",
    32_768,
  );

  if (input.title !== undefined) {
    assertPublishingDisplayName(input.title, "title");
  }

  const resolvedIntent = resolvePublishingDestinationIntent(input.intent, now);
  const canonicalRequestHash = createCanonicalPublishingRequestHash({
    schemaVersion: 2,
    productId: input.productId,
    integrationId: input.integrationId,
    mediaSourceId: input.mediaSourceId,
    content: input.content,
    destinationSettings: input.destinationSettings,
    group: input.group,
    title: input.title ?? null,
    intent:
      resolvedIntent.kind === "schedule"
        ? {
            kind: resolvedIntent.kind,
            timeZone: resolvedIntent.scheduledTimeZone,
            localDateTime: resolvedIntent.scheduledLocalTime,
            utcOffsetMinutes: resolvedIntent.scheduledUtcOffsetMinutes,
          }
        : { kind: resolvedIntent.kind },
  });

  const existing = await readExistingPublishingDestination(
    database,
    input.tenantKey,
    input.productId,
    input.integrationId,
    input.idempotencyKey,
  );

  if (existing !== null) {
    return mapExistingPublishingDestinationResult(
      existing,
      canonicalRequestHash,
      false,
    );
  }

  const workflowId = createPublishingWorkflowId(
    input.tenantKey,
    input.productId,
    input.integrationId,
    input.idempotencyKey,
  );

  try {
    const created = await database.$transaction(async (transaction) => {
      const tenant = await findPublishingTenantOrThrow(
        transaction,
        input.tenantKey,
      );
      const integration = await transaction.integration.findFirst({
        where: {
          id: input.integrationId,
          organizationId: tenant.organizationId,
          deletedAt: null,
          disabled: false,
        },
      });
      const mediaSource = await transaction.clipPublishingMediaSource.findFirst(
        {
          where: {
            id: input.mediaSourceId,
            tenantId: tenant.id,
            media: {
              organizationId: tenant.organizationId,
              deletedAt: null,
            },
          },
          include: { media: true },
        },
      );

      if (integration === null || mediaSource === null) {
        throw new PublishingResourceOwnershipError();
      }

      const post = await transaction.post.create({
        data: {
          state: resolvedIntent.postState,
          publishDate: resolvedIntent.publishDate,
          organizationId: tenant.organizationId,
          integrationId: integration.id,
          content: input.content,
          settings: JSON.stringify(input.destinationSettings),
          group: input.group,
          ...(input.title === undefined ? {} : { title: input.title.trim() }),
          image: mediaSource.media.path,
          creationMethod: "WEB",
        },
      });
      const postState = await transaction.clipPublishingPostState.create({
        data: {
          tenantId: tenant.id,
          productId: input.productId,
          postId: post.id,
          integrationId: integration.id,
          mediaSourceId: mediaSource.id,
          idempotencyKey: input.idempotencyKey,
          canonicalRequestHash,
          sourceKind: mediaSource.sourceKind,
          sourceRecordId: mediaSource.sourceRecordId,
          sourceRevision: mediaSource.sourceRevision,
          intent: resolvedIntent.databaseIntent,
          scheduledTimeZone: resolvedIntent.scheduledTimeZone,
          scheduledLocalTime: resolvedIntent.scheduledLocalTime,
          scheduledUtcOffsetMinutes: resolvedIntent.scheduledUtcOffsetMinutes,
          workflowId,
          internalState: resolvedIntent.internalState,
        },
      });
      const attempt =
        resolvedIntent.kind === "draft"
          ? null
          : await transaction.clipPublishingAttempt.create({
              data: {
                tenantId: tenant.id,
                postStateId: postState.id,
                attemptNumber: 1,
                actorClerkUserId: input.actorClerkUserId,
              },
            });
      const outbox =
        resolvedIntent.availableAt === null
          ? null
          : await transaction.clipPublishingOutbox.create({
              data: {
                tenantId: tenant.id,
                postStateId: postState.id,
                workflowId,
                eventType: "publishing.destination.requested",
                eventVersion: 1,
                availableAt: resolvedIntent.availableAt,
                payload: {
                  schemaVersion: 2,
                  tenantId: tenant.id,
                  productId: input.productId,
                  postId: post.id,
                  postStateId: postState.id,
                  integrationId: integration.id,
                  workflowId,
                  intent: resolvedIntent.kind,
                },
              },
            });

      await transaction.clipPublishingAuditEvent.create({
        data: {
          tenantId: tenant.id,
          actorClerkUserId: input.actorClerkUserId,
          requestId: input.requestId,
          action: "publishing.destination.create",
          subjectType: "post",
          subjectId: post.id,
          result: resolvedIntent.kind === "draft" ? "draft" : "queued",
          safeMetadata: {
            schemaVersion: 2,
            productId: input.productId,
            intent: resolvedIntent.kind,
          },
        },
      });

      return {
        postId: post.id,
        postStateId: postState.id,
        attemptId: attempt?.id ?? null,
        outboxId: outbox?.id ?? null,
        workflowId,
        canonicalRequestHash: postState.canonicalRequestHash,
        publishDate: post.publishDate,
        intent: resolvedIntent.kind,
        scheduledTimeZone: postState.scheduledTimeZone,
        scheduledLocalTime: postState.scheduledLocalTime,
        scheduledUtcOffsetMinutes: postState.scheduledUtcOffsetMinutes,
      };
    });

    return mapExistingPublishingDestinationResult(
      created,
      canonicalRequestHash,
      true,
    );
  } catch (error) {
    if (!isPrismaUniqueConstraintError(error)) {
      throw error;
    }

    const concurrent = await readExistingPublishingDestination(
      database,
      input.tenantKey,
      input.productId,
      input.integrationId,
      input.idempotencyKey,
    );

    if (concurrent === null) {
      throw error;
    }

    return mapExistingPublishingDestinationResult(
      concurrent,
      canonicalRequestHash,
      false,
    );
  }
};
