import type { PrismaClient } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { PublishingListPageInput } from "./PublishingListPageInput.js";
import { assertPublishingOptionalDate } from "./assertPublishingOptionalDate.js";
import { readPublishingListLimit } from "./readPublishingListLimit.js";

export const listTenantMediaSources = (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  input: PublishingListPageInput = {},
) => {
  assertPublishingOptionalDate(input.before, "before");

  return database.clipPublishingMediaSource.findMany({
    where: {
      tenant: { tenantKey },
      ...(input.before === undefined
        ? {}
        : { createdAt: { lt: input.before } }),
    },
    include: { media: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: readPublishingListLimit(input.limit),
  });
};
