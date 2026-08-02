import type { PrismaClient } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { ListTenantAttemptsInput } from "./ListTenantAttemptsInput.js";
import { assertPublishingOptionalDate } from "./assertPublishingOptionalDate.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { readPublishingListLimit } from "./readPublishingListLimit.js";

export const listTenantAttempts = (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  input: ListTenantAttemptsInput = {},
) => {
  assertPublishingOptionalDate(input.before, "before");

  if (input.postStateId !== undefined) {
    assertPublishingPersistenceIdentifier(input.postStateId, "postStateId");
  }

  return database.clipPublishingAttempt.findMany({
    where: {
      tenant: { tenantKey },
      ...(input.postStateId === undefined
        ? {}
        : { postStateId: input.postStateId }),
      ...(input.status === undefined ? {} : { status: input.status }),
      ...(input.before === undefined
        ? {}
        : { createdAt: { lt: input.before } }),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: readPublishingListLimit(input.limit),
  });
};
