import type { PrismaClient } from "@prisma/client";

import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { ProviderTokenEnvelope } from "../tokens/ProviderTokenEnvelope.js";
import { decryptProviderToken } from "../tokens/decryptProviderToken.js";
import type { RefreshPublishingProviderConnectionInput } from "./RefreshPublishingProviderConnectionInput.js";
import { acquirePublishingAdvisoryLock } from "./acquirePublishingAdvisoryLock.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { findPublishingTenantOrThrow } from "./findPublishingTenantOrThrow.js";
import { mapProviderTokenKind } from "./mapProviderTokenKind.js";
import { mapPublishingProvider } from "./mapPublishingProvider.js";
import { persistPublishingProviderConnection } from "./persistPublishingProviderConnection.js";

export const refreshPublishingProviderConnection = async (
  database: PrismaClient,
  input: RefreshPublishingProviderConnectionInput,
) => {
  assertPublishingPersistenceIdentifier(input.integrationId, "integrationId");

  if (
    input.refreshedAt !== undefined &&
    !Number.isSafeInteger(input.refreshedAt.getTime())
  ) {
    throw new PublishingPersistenceValidationError("refreshedAt");
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
        deletedAt: null,
        disabled: false,
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
        deletedAt: null,
        disabled: false,
      },
    });
    const secret = await transaction.clipPublishingIntegrationSecret.findFirst({
      where: {
        tenantId: tenant.id,
        integrationId: input.integrationId,
        providerIdentifier: mapPublishingProvider(input.provider),
        tokenKind: mapProviderTokenKind(input.credentialKind),
        replacedAt: null,
      },
      orderBy: { version: "desc" },
    });

    if (integration === null || secret === null) {
      throw new PublishingResourceOwnershipError();
    }

    const plaintextCredential = decryptProviderToken(
      secret.envelope as ProviderTokenEnvelope,
      input.keyring,
      {
        tenantKey: input.tenantKey,
        provider: input.provider,
        integrationId: integration.id,
        tokenKind: input.credentialKind,
      },
    );
    const connection = await input.refreshConnection(plaintextCredential);

    if (
      connection.provider !== input.provider ||
      connection.accountId !== integration.internalId
    ) {
      throw new PublishingPersistenceValidationError("refreshedConnection");
    }

    return persistPublishingProviderConnection({
      transaction,
      tenantId: tenant.id,
      organizationId: tenant.organizationId,
      tenantKey: input.tenantKey,
      connection,
      cipherKey: input.cipherKey,
      connectedAt: input.refreshedAt ?? new Date(),
      missingRefreshTokenPolicy: "preserve",
    });
  });
};
