import type { PrismaClient } from "@prisma/client";

import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { StorePublishingIntegrationSecretInput } from "./StorePublishingIntegrationSecretInput.js";
import { acquirePublishingAdvisoryLock } from "./acquirePublishingAdvisoryLock.js";
import { assertPublishingOptionalDate } from "./assertPublishingOptionalDate.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { findPublishingTenantOrThrow } from "./findPublishingTenantOrThrow.js";
import { managedIntegrationTokenMarker } from "./managedIntegrationTokenMarker.js";
import { rotatePublishingIntegrationSecret } from "./rotatePublishingIntegrationSecret.js";

export const storePublishingIntegrationSecret = async (
  database: PrismaClient,
  input: StorePublishingIntegrationSecretInput,
) => {
  assertPublishingPersistenceIdentifier(input.integrationId, "integrationId");
  assertPublishingOptionalDate(input.expiresAt, "expiresAt");

  return database.$transaction(async (transaction) => {
    const tenant = await findPublishingTenantOrThrow(
      transaction,
      input.tenantKey,
    );
    const integration = await transaction.integration.findFirst({
      where: {
        id: input.integrationId,
        organizationId: tenant.organizationId,
        providerIdentifier: input.provider,
        deletedAt: null,
      },
    });

    if (integration === null) {
      throw new PublishingResourceOwnershipError();
    }

    await acquirePublishingAdvisoryLock(
      transaction,
      `publishing-integration:${tenant.id}:${integration.internalId}`,
    );
    const createdAt = new Date();
    const secret = await rotatePublishingIntegrationSecret({
      transaction,
      tenantId: tenant.id,
      tenantKey: input.tenantKey,
      integrationId: integration.id,
      provider: input.provider,
      tokenKind: input.tokenKind,
      plaintextToken: input.plaintextToken,
      cipherKey: input.cipherKey,
      expiresAt: input.expiresAt ?? null,
      createdAt,
    });

    if (
      integration.token !== managedIntegrationTokenMarker ||
      integration.refreshToken !== null
    ) {
      await transaction.integration.update({
        where: { id: integration.id },
        data: {
          token: managedIntegrationTokenMarker,
          refreshToken: null,
        },
      });
    }

    return secret;
  });
};
