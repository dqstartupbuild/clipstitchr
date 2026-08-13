import type { Prisma } from "@prisma/client";

import { publishingIntegrationSafeSelect } from "../persistence/publishingIntegrationSafeSelect.js";

export const publishingApiPostStateInclude = {
  post: true,
  integration: { select: publishingIntegrationSafeSelect },
  attempts: {
    orderBy: [{ attemptNumber: "desc" as const }, { id: "desc" as const }],
    take: 100,
  },
  receipts: {
    orderBy: [{ observedAt: "desc" as const }, { id: "desc" as const }],
    take: 100,
    include: {
      publications: {
        orderBy: [{ createdAt: "desc" as const }, { id: "desc" as const }],
        take: 100,
      },
    },
  },
  outboxEvents: {
    orderBy: [{ createdAt: "desc" as const }, { id: "desc" as const }],
    take: 100,
  },
} as const satisfies Prisma.ClipPublishingPostStateInclude;

export type PublishingApiPostStateRecord =
  Prisma.ClipPublishingPostStateGetPayload<{
    include: typeof publishingApiPostStateInclude;
  }>;
