import type { Prisma, PrismaClient } from "@prisma/client";

import { PublishingTenantNotFoundError } from "../errors/PublishingTenantNotFoundError.js";
import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";

export const findPublishingTenantOrThrow = async (
  database: PrismaClient | Prisma.TransactionClient,
  tenantKey: PublishingTenantKey,
) => {
  const tenant = await database.clipPublishingTenant.findUnique({
    where: { tenantKey },
  });

  if (tenant === null) {
    throw new PublishingTenantNotFoundError();
  }

  return tenant;
};
