import type { PrismaClient } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { PublishingListPageInput } from "./PublishingListPageInput.js";
import { assertPublishingOptionalDate } from "./assertPublishingOptionalDate.js";
import { findPublishingTenantOrThrow } from "./findPublishingTenantOrThrow.js";
import { publishingIntegrationSafeSelect } from "./publishingIntegrationSafeSelect.js";
import { readPublishingListLimit } from "./readPublishingListLimit.js";

export const listTenantIntegrations = async (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  input: PublishingListPageInput = {},
) => {
  assertPublishingOptionalDate(input.before, "before");
  const tenant = await findPublishingTenantOrThrow(database, tenantKey);

  return database.integration.findMany({
    where: {
      organizationId: tenant.organizationId,
      deletedAt: null,
      ...(input.before === undefined
        ? {}
        : { createdAt: { lt: input.before } }),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: readPublishingListLimit(input.limit),
    select: publishingIntegrationSafeSelect,
  });
};
