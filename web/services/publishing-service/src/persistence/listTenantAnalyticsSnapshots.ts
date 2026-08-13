import type { PrismaClient } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { ListTenantAnalyticsSnapshotsInput } from "./ListTenantAnalyticsSnapshotsInput.js";
import { assertPublishingOptionalDate } from "./assertPublishingOptionalDate.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { readPublishingListLimit } from "./readPublishingListLimit.js";

export const listTenantAnalyticsSnapshots = (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  input: ListTenantAnalyticsSnapshotsInput = {},
) => {
  assertPublishingOptionalDate(input.before, "before");
  assertPublishingOptionalDate(input.observedAtOrAfter, "observedAtOrAfter");

  if (input.integrationId !== undefined) {
    assertPublishingPersistenceIdentifier(input.integrationId, "integrationId");
  }

  if (input.postStateId !== undefined) {
    assertPublishingPersistenceIdentifier(input.postStateId, "postStateId");
  }

  return database.clipPublishingAnalyticsSnapshot.findMany({
    where: {
      tenant: { tenantKey },
      ...(input.integrationId === undefined
        ? {}
        : { integrationId: input.integrationId }),
      ...(input.postStateId === undefined
        ? {}
        : { postStateId: input.postStateId }),
      ...(input.before === undefined && input.observedAtOrAfter === undefined
        ? {}
        : {
            observedAt: {
              ...(input.before === undefined ? {} : { lt: input.before }),
              ...(input.observedAtOrAfter === undefined
                ? {}
                : { gte: input.observedAtOrAfter }),
            },
          }),
    },
    orderBy: [{ observedAt: "desc" }, { id: "desc" }],
    take: readPublishingListLimit(input.limit),
  });
};
