import type { PrismaClient } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { PublishingListPageInput } from "./PublishingListPageInput.js";
import { assertPublishingOptionalDate } from "./assertPublishingOptionalDate.js";
import { readPublishingListLimit } from "./readPublishingListLimit.js";

export const listTenantReceipts = (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  input: PublishingListPageInput = {},
) => {
  assertPublishingOptionalDate(input.before, "before");

  return database.clipPublishingReceipt.findMany({
    where: {
      tenant: { tenantKey },
      ...(input.before === undefined
        ? {}
        : { observedAt: { lt: input.before } }),
    },
    include: {
      publications: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 20,
      },
    },
    orderBy: [{ observedAt: "desc" }, { id: "desc" }],
    take: readPublishingListLimit(input.limit),
  });
};
