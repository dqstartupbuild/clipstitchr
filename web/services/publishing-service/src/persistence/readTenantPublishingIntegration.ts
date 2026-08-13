import type { PrismaClient } from "@prisma/client";

import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { ReadTenantPublishingIntegrationInput } from "./ReadTenantPublishingIntegrationInput.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { findPublishingTenantOrThrow } from "./findPublishingTenantOrThrow.js";
import { publishingIntegrationSafeSelect } from "./publishingIntegrationSafeSelect.js";

export const readTenantPublishingIntegration = async (
  database: PrismaClient,
  input: ReadTenantPublishingIntegrationInput,
) => {
  assertPublishingPersistenceIdentifier(input.integrationId, "integrationId");
  const tenant = await findPublishingTenantOrThrow(database, input.tenantKey);
  const integration = await database.integration.findFirst({
    where: {
      id: input.integrationId,
      organizationId: tenant.organizationId,
      providerIdentifier: input.provider,
      deletedAt: null,
      disabled: false,
    },
    select: publishingIntegrationSafeSelect,
  });

  if (integration === null) {
    throw new PublishingResourceOwnershipError();
  }

  return integration;
};
