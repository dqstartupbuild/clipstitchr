import type { PrismaClient } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import { mapPublishingApiPostSummary } from "./mapPublishingApiPostSummary.js";
import { publishingApiPostStateInclude } from "./publishingApiPostStateInclude.js";

export const listPrismaPublishingApiCalendar = async (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  productId: string,
  from: Date,
  to: Date,
) => {
  const records = await database.clipPublishingPostState.findMany({
    where: {
      tenant: { tenantKey },
      productId,
      intent: "SCHEDULE",
      post: {
        deletedAt: null,
        publishDate: { gte: from, lt: to },
      },
    },
    include: publishingApiPostStateInclude,
    orderBy: [{ post: { publishDate: "asc" } }, { id: "asc" }],
    take: 2_000,
  });
  return Object.freeze(records.map(mapPublishingApiPostSummary));
};
