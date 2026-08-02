import type { PrismaClient } from "@prisma/client";

import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import type { UpsertPublishingProviderConnectionsInput } from "./UpsertPublishingProviderConnectionsInput.js";
import { acquirePublishingAdvisoryLock } from "./acquirePublishingAdvisoryLock.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { findPublishingTenantOrThrow } from "./findPublishingTenantOrThrow.js";
import { persistPublishingProviderConnection } from "./persistPublishingProviderConnection.js";

export const upsertPublishingProviderConnections = async (
  database: PrismaClient,
  input: UpsertPublishingProviderConnectionsInput,
) => {
  const connectedAt = input.connectedAt ?? new Date();
  const missingRefreshTokenPolicy =
    input.missingRefreshTokenPolicy ?? "preserve";

  if (
    input.connections.length < 1 ||
    input.connections.length > 100 ||
    !Number.isSafeInteger(connectedAt.getTime())
  ) {
    throw new PublishingPersistenceValidationError("connections");
  }

  const accountIds = input.connections.map(({ accountId }) => accountId);

  for (const accountId of accountIds) {
    assertPublishingPersistenceIdentifier(accountId, "accountId");
  }

  if (new Set(accountIds).size !== accountIds.length) {
    throw new PublishingPersistenceValidationError("connections.accountId");
  }

  return database.$transaction(async (transaction) => {
    const tenant = await findPublishingTenantOrThrow(
      transaction,
      input.tenantKey,
    );

    for (const accountId of [...accountIds].sort()) {
      await acquirePublishingAdvisoryLock(
        transaction,
        `publishing-integration:${tenant.id}:${accountId}`,
      );
    }

    const results = [];

    for (const connection of input.connections) {
      results.push(
        await persistPublishingProviderConnection({
          transaction,
          tenantId: tenant.id,
          organizationId: tenant.organizationId,
          tenantKey: input.tenantKey,
          connection,
          cipherKey: input.cipherKey,
          connectedAt,
          missingRefreshTokenPolicy,
        }),
      );
    }

    return Object.freeze(results);
  });
};
