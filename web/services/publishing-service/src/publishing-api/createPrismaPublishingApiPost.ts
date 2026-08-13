import type { PrismaClient } from "@prisma/client";

import { PublishingApiConflictError } from "./PublishingApiConflictError.js";
import type { ClerkTenantIdentity } from "../identity/ClerkTenantIdentity.js";
import { createPublishingDestination } from "../persistence/createPublishingDestination.js";
import { createPublishingMediaSource } from "../persistence/createPublishingMediaSource.js";
import type { PublishingDestinationIntent } from "../persistence/PublishingDestinationIntent.js";
import type { CanonicalJsonValue } from "../persistence/CanonicalJsonValue.js";
import type { PublishingApiCreatePostRequest } from "./PublishingApiCreatePostRequest.js";
import { createPublishingApiCompatibilityIssues } from "./createPublishingApiCompatibilityIssues.js";
import { readOwnedPublishingApiIntegrations } from "./readOwnedPublishingApiIntegrations.js";
import { readPrismaPublishingApiPost } from "./readPrismaPublishingApiPost.js";

export const createPrismaPublishingApiPost = async (
  database: PrismaClient,
  identity: ClerkTenantIdentity,
  requestId: string,
  request: PublishingApiCreatePostRequest,
  now: Date,
) => {
  const integrations = await readOwnedPublishingApiIntegrations(
    database,
    identity.tenantKey,
    request.destinations,
  );
  for (const destination of request.destinations) {
    const integration = integrations.get(destination.integrationId)!;
    if (integration.disabled || integration.refreshNeeded) {
      throw new PublishingApiConflictError("connection_needs_attention");
    }
    if (
      createPublishingApiCompatibilityIssues(
        destination.provider,
        request.resolvedMedia.objects,
      ).some(({ severity }) => severity === "error")
    ) {
      throw new PublishingApiConflictError("media_incompatible");
    }
  }
  const mediaSource = await createPublishingMediaSource(database, {
    tenantKey: identity.tenantKey,
    sourceKind: request.resolvedMedia.sourceKind,
    sourceRecordId: request.resolvedMedia.sourceRecordId,
    sourceRevision: request.resolvedMedia.sourceRevision,
    contentChecksum: request.resolvedMedia.contentChecksum,
    displayName: "Publishing media",
    mediaType: request.resolvedMedia.objects.some(({ contentType }) =>
      contentType.toLowerCase().startsWith("video/"),
    )
      ? "video"
      : "image",
    objects: request.resolvedMedia.objects,
    compatibilityFacts: {
      schemaVersion: 1,
      objectCount: request.resolvedMedia.objects.length,
    },
  });
  const intent: PublishingDestinationIntent =
    request.intent === "schedule"
      ? { kind: "schedule", schedule: request.schedule! }
      : { kind: request.intent };
  const created = [];
  for (const destination of request.destinations) {
    const result = await createPublishingDestination(
      database,
      {
        tenantKey: identity.tenantKey,
        productId: request.productId,
        integrationId: destination.integrationId,
        mediaSourceId: mediaSource.id,
        idempotencyKey: request.idempotencyKey,
        actorClerkUserId: identity.actorUserId,
        requestId,
        content: request.caption,
        destinationSettings: destination.settings as CanonicalJsonValue,
        intent,
        group: requestId,
        ...(destination.provider === "youtube"
          ? { title: destination.settings.title }
          : {}),
      },
      now,
    );
    const post = await readPrismaPublishingApiPost(
      database,
      identity.tenantKey,
      request.productId,
      result.postId,
    );
    created.push(
      Object.freeze({
        integrationId: destination.integrationId,
        message: post.statusMessage,
        postId: result.postId,
        status: post.status,
      }),
    );
  }
  return Object.freeze({
    destinations: Object.freeze(created),
    productId: request.productId,
    requestId,
  });
};
