import type { Prisma } from "@prisma/client";

import type { PublishingApiAnalyticsMetric } from "./PublishingApiAnalyticsMetric.js";

export const readPublishingApiSnapshotMetrics = (
  value: Prisma.JsonValue,
): readonly PublishingApiAnalyticsMetric[] | null => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, Prisma.JsonValue>;
  if (
    record["schemaVersion"] !== 1 ||
    !Array.isArray(record["metrics"]) ||
    Object.keys(record).some(
      (key) =>
        key !== "schemaVersion" &&
        key !== "remotePublicationId" &&
        key !== "metrics",
    )
  ) {
    return null;
  }
  const metrics: PublishingApiAnalyticsMetric[] = [];
  for (const value of record["metrics"]) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }
    const metric = value as Record<string, Prisma.JsonValue>;
    if (
      Object.keys(metric).length !== 4 ||
      typeof metric["key"] !== "string" ||
      metric["key"].length < 1 ||
      metric["key"].length > 128 ||
      typeof metric["label"] !== "string" ||
      metric["label"].length < 1 ||
      metric["label"].length > 4_096 ||
      metric["unit"] !== "count" ||
      typeof metric["value"] !== "number" ||
      !Number.isFinite(metric["value"]) ||
      metric["value"] < 0
    ) {
      return null;
    }
    metrics.push(
      Object.freeze({
        key: metric["key"],
        label: metric["label"],
        unit: "count",
        value: metric["value"],
      }),
    );
  }
  return Object.freeze(metrics.slice(0, 100));
};
