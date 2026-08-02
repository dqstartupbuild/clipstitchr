import type { PrismaClient } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { ListTenantPostStatesInput } from "./ListTenantPostStatesInput.js";
import { assertPublishingOptionalDate } from "./assertPublishingOptionalDate.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { publishingIntegrationSafeSelect } from "./publishingIntegrationSafeSelect.js";
import { readPublishingListLimit } from "./readPublishingListLimit.js";

export const listTenantPostStates = (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  input: ListTenantPostStatesInput = {},
) => {
  assertPublishingOptionalDate(input.before, "before");

  if (input.integrationId !== undefined) {
    assertPublishingPersistenceIdentifier(input.integrationId, "integrationId");
  }

  return database.clipPublishingPostState.findMany({
    where: {
      tenant: { tenantKey },
      ...(input.integrationId === undefined
        ? {}
        : { integrationId: input.integrationId }),
      ...(input.internalState === undefined
        ? {}
        : { internalState: input.internalState }),
      ...(input.before === undefined
        ? {}
        : { createdAt: { lt: input.before } }),
    },
    include: {
      post: true,
      integration: { select: publishingIntegrationSafeSelect },
      mediaSource: { include: { media: true } },
      attempts: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 20,
      },
      receipts: {
        orderBy: [{ observedAt: "desc" }, { id: "desc" }],
        take: 20,
        include: {
          publications: {
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: 20,
          },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: readPublishingListLimit(input.limit),
  });
};
