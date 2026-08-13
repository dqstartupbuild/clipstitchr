import type { PrismaClient } from "@prisma/client";

import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { DisconnectPublishingIntegrationInput } from "./DisconnectPublishingIntegrationInput.js";
import { acquirePublishingAdvisoryLock } from "./acquirePublishingAdvisoryLock.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { findPublishingTenantOrThrow } from "./findPublishingTenantOrThrow.js";
import { managedIntegrationTokenMarker } from "./managedIntegrationTokenMarker.js";
import { publishingIntegrationSafeSelect } from "./publishingIntegrationSafeSelect.js";

export const disconnectPublishingIntegration = async (
  database: PrismaClient,
  input: DisconnectPublishingIntegrationInput,
) => {
  const disconnectedAt = input.disconnectedAt ?? new Date();

  assertPublishingPersistenceIdentifier(input.integrationId, "integrationId");
  assertPublishingPersistenceIdentifier(
    input.actorClerkUserId,
    "actorClerkUserId",
  );
  assertPublishingPersistenceIdentifier(input.requestId, "requestId");

  if (!Number.isSafeInteger(disconnectedAt.getTime())) {
    throw new PublishingPersistenceValidationError("disconnectedAt");
  }

  return database.$transaction(async (transaction) => {
    const tenant = await findPublishingTenantOrThrow(
      transaction,
      input.tenantKey,
    );
    const lockTarget = await transaction.integration.findFirst({
      where: {
        id: input.integrationId,
        organizationId: tenant.organizationId,
        providerIdentifier: input.provider,
      },
      select: { internalId: true },
    });

    if (lockTarget === null) {
      throw new PublishingResourceOwnershipError();
    }

    await acquirePublishingAdvisoryLock(
      transaction,
      `publishing-integration:${tenant.id}:${lockTarget.internalId}`,
    );
    const integration = await transaction.integration.findFirst({
      where: {
        id: input.integrationId,
        internalId: lockTarget.internalId,
        organizationId: tenant.organizationId,
        providerIdentifier: input.provider,
      },
    });

    if (integration === null) {
      throw new PublishingResourceOwnershipError();
    }

    await transaction.clipPublishingIntegrationSecret.updateMany({
      where: {
        tenantId: tenant.id,
        integrationId: integration.id,
        replacedAt: null,
      },
      data: { replacedAt: disconnectedAt },
    });
    const disconnected = await transaction.integration.update({
      where: { id: integration.id },
      data: {
        disabled: true,
        deletedAt: disconnectedAt,
        token: managedIntegrationTokenMarker,
        refreshToken: null,
        refreshNeeded: false,
        inBetweenSteps: false,
      },
      select: publishingIntegrationSafeSelect,
    });

    await transaction.clipPublishingAuditEvent.create({
      data: {
        tenantId: tenant.id,
        actorClerkUserId: input.actorClerkUserId,
        requestId: input.requestId,
        action: "publishing.integration.disconnect",
        subjectType: "integration",
        subjectId: integration.id,
        result: "disconnected",
        safeMetadata: {
          schemaVersion: 1,
          provider: input.provider,
        },
      },
    });

    return disconnected;
  });
};
