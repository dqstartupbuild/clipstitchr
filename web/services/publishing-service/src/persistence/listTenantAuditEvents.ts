import type { PrismaClient } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { PublishingListPageInput } from "./PublishingListPageInput.js";
import { assertPublishingOptionalDate } from "./assertPublishingOptionalDate.js";
import { readPublishingListLimit } from "./readPublishingListLimit.js";

export const listTenantAuditEvents = (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  input: PublishingListPageInput = {},
) => {
  assertPublishingOptionalDate(input.before, "before");

  return database.clipPublishingAuditEvent.findMany({
    where: {
      tenant: { tenantKey },
      ...(input.before === undefined
        ? {}
        : { createdAt: { lt: input.before } }),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: readPublishingListLimit(input.limit),
  });
};
