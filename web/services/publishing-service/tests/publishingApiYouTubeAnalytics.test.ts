import { describe, expect, it } from "vitest";

import { normalizePublishingApiAnalyticsMetrics } from "../src/publishing-api/normalizePublishingApiAnalyticsMetrics.js";

describe("YouTube publishing analytics normalization", () => {
  it("normalizes official account and post metrics to public units", () => {
    expect(
      normalizePublishingApiAnalyticsMetrics([
        { name: "Views", value: 120 },
        { name: "Favorites", value: 2 },
        { name: "estimatedMinutesWatched", value: 3.5 },
        { name: "averageViewDuration", value: 42 },
        { name: "averageViewPercentage", value: 67.5 },
        { name: "subscribersGained", value: 4 },
        { name: "subscribersLost", value: 1 },
      ]),
    ).toEqual([
      { key: "views", label: "Views", unit: "count", value: 120 },
      { key: "favorites", label: "Favorites", unit: "count", value: 2 },
      {
        key: "watch_time",
        label: "Watch time",
        unit: "duration-seconds",
        value: 210,
      },
      {
        key: "average_view_duration",
        label: "Average view duration",
        unit: "duration-seconds",
        value: 42,
      },
      {
        key: "average_view_percentage",
        label: "Average viewed",
        unit: "percent",
        value: 67.5,
      },
      {
        key: "subscribers_gained",
        label: "Subscribers gained",
        unit: "count",
        value: 4,
      },
      {
        key: "subscribers_lost",
        label: "Subscribers lost",
        unit: "count",
        value: 1,
      },
    ]);
  });
});
