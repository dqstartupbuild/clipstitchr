import type { PrismaClient } from "@prisma/client";

import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import { findPublishingTenantOrThrow } from "../persistence/findPublishingTenantOrThrow.js";
import { publishingIntegrationSafeSelect } from "../persistence/publishingIntegrationSafeSelect.js";

export const readOwnedPublishingApiIntegrations = async (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  destinations: readonly Readonly<{
    integrationId: string;
    provider: "instagram" | "tiktok" | "youtube";
  }>[],
) => {
  const tenant = await findPublishingTenantOrThrow(database, tenantKey);
  const integrations = await database.integration.findMany({
    where: {
      id: { in: destinations.map(({ integrationId }) => integrationId) },
      organizationId: tenant.organizationId,
      deletedAt: null,
    },
    select: publishingIntegrationSafeSelect,
  });
  if (integrations.length !== destinations.length) {
    throw new PublishingResourceOwnershipError();
  }
  const byId = new Map(integrations.map((integration) => [integration.id, integration]));
  for (const destination of destinations) {
    const integration = byId.get(destination.integrationId);
    if (integration === undefined) {
      throw new PublishingResourceOwnershipError();
    }
    const matches = destination.provider === "tiktok"
      ? integration.providerIdentifier === "tiktok"
      : destination.provider === "youtube"
        ? integration.providerIdentifier === "youtube"
        : integration.providerIdentifier === "instagram" ||
          integration.providerIdentifier === "instagram-standalone";
    if (!matches || integration.type !== integration.providerIdentifier) {
      throw new PublishingResourceOwnershipError();
    }
  }
  return byId;
};
