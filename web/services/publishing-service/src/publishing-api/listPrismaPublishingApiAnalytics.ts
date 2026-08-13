import type { PrismaClient } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import { publishingIntegrationSafeSelect } from "../persistence/publishingIntegrationSafeSelect.js";
import type { PublishingApiAnalyticsMetric } from "./PublishingApiAnalyticsMetric.js";
import type { PublishingApiAnalyticsResponse } from "./PublishingApiAnalyticsResponse.js";
import { readPublishingApiSnapshotMetrics } from "./readPublishingApiSnapshotMetrics.js";

const RANGE_DAYS = Object.freeze({ "7d": 7, "30d": 30, "90d": 90 });

export const listPrismaPublishingApiAnalytics = async (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  productId: string,
  range: "7d" | "30d" | "90d",
  now: Date,
): Promise<PublishingApiAnalyticsResponse> => {
  const observedAtOrAfter = new Date(
    now.getTime() - RANGE_DAYS[range] * 86_400_000,
  );
  const records = await database.clipPublishingPostState.findMany({
    where: {
      tenant: { tenantKey },
      productId,
      internalState: "PUBLISHED",
      post: { deletedAt: null },
    },
    include: {
      post: true,
      integration: { select: publishingIntegrationSafeSelect },
      analytics: {
        where: { observedAt: { gte: observedAtOrAfter } },
        orderBy: [{ observedAt: "desc" }, { id: "desc" }],
        take: 1,
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
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: 500,
  });
  const publications: PublishingApiAnalyticsResponse["publications"][number][] = [];
  const unsupported = new Set<string>();
  for (const record of records) {
    const snapshot = record.analytics[0];
    const metrics =
      snapshot === undefined
        ? null
        : readPublishingApiSnapshotMetrics(snapshot.metrics);
    const provider =
      record.integration.providerIdentifier === "tiktok"
        ? "tiktok"
        : record.integration.providerIdentifier === "youtube"
          ? "youtube"
        : record.integration.providerIdentifier === "instagram" ||
            record.integration.providerIdentifier === "instagram-standalone"
          ? "instagram"
          : null;
    if (snapshot === undefined || metrics === null || provider === null) {
      unsupported.add(
        `${record.integration.name.trim() || "This account"} does not have analytics yet.`,
      );
      continue;
    }
    const observableUrl = record.receipts
      .flatMap(({ publications }) => publications)
      .map(({ observableUrl }) => observableUrl)
      .find((url) => {
        if (url === null) return false;
        try {
          return new URL(url).protocol === "https:";
        } catch {
          return false;
        }
      });
    publications.push(
      Object.freeze({
        accountName: record.integration.name.trim() || "Connected account",
        caption: record.post.content.slice(0, 10_000),
        id: record.postId,
        metrics,
        observedAt: snapshot.observedAt.toISOString(),
        productId,
        provider,
        resultUrl: observableUrl ?? null,
      }),
    );
  }
  const aggregate = new Map<string, PublishingApiAnalyticsMetric>();
  for (const publication of publications) {
    for (const metric of publication.metrics) {
      const existing = aggregate.get(metric.key);
      aggregate.set(
        metric.key,
        Object.freeze({
          ...metric,
          value: (existing?.value ?? 0) + metric.value,
        }),
      );
    }
  }
  const observedAt = publications.reduce<string | null>(
    (latest, publication) =>
      latest === null || publication.observedAt > latest
        ? publication.observedAt
        : latest,
    null,
  );
  return Object.freeze({
    productId,
    metrics: Object.freeze([...aggregate.values()].slice(0, 100)),
    observedAt,
    publications: Object.freeze(publications),
    range,
    unsupported: Object.freeze([...unsupported].slice(0, 100)),
  });
};
