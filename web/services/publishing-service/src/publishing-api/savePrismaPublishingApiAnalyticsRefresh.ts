import type { PrismaClient } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import { appendPublishingAnalyticsSnapshot } from "../persistence/appendPublishingAnalyticsSnapshot.js";
import type { ProviderAnalyticsMetric } from "../provider-runtime/contracts/ProviderAnalyticsMetric.js";
import type { PublishingApiAnalyticsRefreshTarget } from "./PublishingApiAnalyticsRefreshTarget.js";
import { normalizePublishingApiAnalyticsMetrics } from "./normalizePublishingApiAnalyticsMetrics.js";
import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";

export const savePrismaPublishingApiAnalyticsRefresh = async (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  target: PublishingApiAnalyticsRefreshTarget,
  metrics: readonly ProviderAnalyticsMetric[],
  observedAt: Date,
) => {
  const owned = await database.clipPublishingPostState.findFirst({
    where: {
      id: target.postStateId,
      postId: target.postId,
      productId: target.productId,
      tenant: { tenantKey },
      receipts: { some: { id: target.receiptId } },
    },
    select: { id: true },
  });
  if (owned === null) {
    throw new PublishingResourceOwnershipError();
  }
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
      schemaVersion: 2,
      productId: target.productId,
      remotePublicationId: target.remotePublicationId,
      metrics: safeMetrics,
    },
  });
  return safeMetrics;
};
