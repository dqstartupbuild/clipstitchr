import type { PrismaClient } from "@prisma/client";

import type { CreatePublishingTenantInput } from "./CreatePublishingTenantInput.js";
import { assertPublishingDisplayName } from "./assertPublishingDisplayName.js";
import { isPrismaUniqueConstraintError } from "./isPrismaUniqueConstraintError.js";

export const resolveOrCreatePublishingTenant = async (
  database: PrismaClient,
  input: CreatePublishingTenantInput,
) => {
  assertPublishingDisplayName(input.organizationName, "organizationName");

  const existing = await database.clipPublishingTenant.findUnique({
    where: { tenantKey: input.tenantKey },
  });

  if (existing !== null) {
    return existing;
  }

  try {
    return await database.$transaction(async (transaction) => {
      const organization = await transaction.organization.create({
        data: { name: input.organizationName.trim() },
      });

      return transaction.clipPublishingTenant.create({
        data: {
          tenantKey: input.tenantKey,
          organizationId: organization.id,
        },
      });
    });
  } catch (error) {
    if (!isPrismaUniqueConstraintError(error)) {
      throw error;
    }

    const concurrent = await database.clipPublishingTenant.findUnique({
      where: { tenantKey: input.tenantKey },
    });

    if (concurrent === null) {
      throw error;
    }

    return concurrent;
  }
};
