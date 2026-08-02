import type { Prisma } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";

export type AppendPublishingAnalyticsSnapshotInput = Readonly<{
  tenantKey: PublishingTenantKey;
  integrationId?: string;
  postStateId?: string;
  receiptId?: string;
  metricWindowStart: Date;
  metricWindowEnd: Date;
  observedAt: Date;
  metrics: Prisma.InputJsonValue;
}>;
