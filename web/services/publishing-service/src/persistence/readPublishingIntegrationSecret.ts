import type { PrismaClient } from "@prisma/client";

import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { ProviderTokenEnvelope } from "../tokens/ProviderTokenEnvelope.js";
import { decryptProviderToken } from "../tokens/decryptProviderToken.js";
import type { ReadPublishingIntegrationSecretInput } from "./ReadPublishingIntegrationSecretInput.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { findPublishingTenantOrThrow } from "./findPublishingTenantOrThrow.js";
import { mapProviderTokenKind } from "./mapProviderTokenKind.js";
import { mapPublishingProvider } from "./mapPublishingProvider.js";

export const readPublishingIntegrationSecret = async (
  database: PrismaClient,
  input: ReadPublishingIntegrationSecretInput,
): Promise<string | null> => {
  assertPublishingPersistenceIdentifier(input.integrationId, "integrationId");
  const tenant = await findPublishingTenantOrThrow(database, input.tenantKey);
  const integration = await database.integration.findFirst({
    where: {
      id: input.integrationId,
      organizationId: tenant.organizationId,
      providerIdentifier: input.provider,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (integration === null) {
    throw new PublishingResourceOwnershipError();
  }

  const secret = await database.clipPublishingIntegrationSecret.findFirst({
    where: {
      tenantId: tenant.id,
      integrationId: input.integrationId,
      providerIdentifier: mapPublishingProvider(input.provider),
      tokenKind: mapProviderTokenKind(input.tokenKind),
      replacedAt: null,
    },
    orderBy: { version: "desc" },
  });

  if (secret === null) {
    return null;
  }

  return decryptProviderToken(
    secret.envelope as ProviderTokenEnvelope,
    input.keyring,
    {
      tenantKey: input.tenantKey,
      provider: input.provider,
      integrationId: input.integrationId,
      tokenKind: input.tokenKind,
    },
  );
};
