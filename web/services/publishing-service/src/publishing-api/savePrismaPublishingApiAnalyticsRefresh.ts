import type { PrismaClient } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import { appendPublishingAnalyticsSnapshot } from "../persistence/appendPublishingAnalyticsSnapshot.js";
import type { ProviderAnalyticsMetric } from "../provider-runtime/contracts/ProviderAnalyticsMetric.js";
import type { PublishingApiAnalyticsRefreshTarget } from "./PublishingApiAnalyticsRefreshTarget.js";
import { normalizePublishingApiAnalyticsMetrics } from "./normalizePublishingApiAnalyticsMetrics.js";

export const savePrismaPublishingApiAnalyticsRefresh = async (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  target: PublishingApiAnalyticsRefreshTarget,
  metrics: readonly ProviderAnalyticsMetric[],
  observedAt: Date,
) => {
  const safeMetrics = normalizePublishingApiAnalyticsMetrics(metrics);
  await appendPublishingAnalyticsSnapshot(database, {
    tenantKey,
    integrationId: target.integrationId,
    postStateId: target.postStateId,
    receiptId: target.receiptId,
    metricWindowStart: new Date(observedAt.getTime() - 30 * 86_400_000),
    metricWindowEnd: observedAt,
    observedAt,
    metrics: {
      schemaVersion: 1,
      remotePublicationId: target.remotePublicationId,
      metrics: safeMetrics,
    },
  });
  return safeMetrics;
};
