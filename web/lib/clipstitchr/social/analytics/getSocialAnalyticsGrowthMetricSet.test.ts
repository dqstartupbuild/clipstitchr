import { describe, expect, it } from "vitest";
import type { SocialAnalyticsSnapshotLike } from "./SocialAnalyticsSnapshotLike";
import { getSocialAnalyticsGrowthMetricSet } from "./getSocialAnalyticsGrowthMetricSet";

function createSnapshot(
  capturedAt: string,
  metrics: Partial<SocialAnalyticsSnapshotLike>,
): SocialAnalyticsSnapshotLike {
  return {
    capturedAt,
    source: "instagram_official",
    views: null,
    reach: null,
    likes: null,
    comments: null,
    shares: null,
    saves: null,
    watchTimeSeconds: null,
    ...metrics,
  };
}

describe("getSocialAnalyticsGrowthMetricSet", () => {
  it("uses the latest snapshots at or before each range boundary", () => {
    const growth = getSocialAnalyticsGrowthMetricSet({
      platform: "instagram",
      snapshots: [
        createSnapshot("2026-07-01T00:00:00.000Z", {
          views: 100,
          likes: 20,
        }),
        createSnapshot("2026-07-08T00:00:00.000Z", {
          views: 145,
          likes: 28,
        }),
        createSnapshot("2026-07-09T00:00:00.000Z", {
          views: 999,
          likes: 999,
        }),
      ],
      rangeStart: "2026-07-01T12:00:00.000Z",
      rangeEnd: "2026-07-08T12:00:00.000Z",
    });

    expect(growth.views).toMatchObject({
      value: 45,
      currentValue: 145,
      baselineValue: 100,
      capturedAt: "2026-07-08T00:00:00.000Z",
      baselineCapturedAt: "2026-07-01T00:00:00.000Z",
    });
    expect(growth.likes.value).toBe(8);
  });

  it("preserves signed platform corrections", () => {
    const growth = getSocialAnalyticsGrowthMetricSet({
      platform: "instagram",
      snapshots: [
        createSnapshot("2026-07-01T00:00:00.000Z", { views: 100 }),
        createSnapshot("2026-07-08T00:00:00.000Z", { views: 94 }),
      ],
      rangeStart: "2026-07-01T00:00:00.000Z",
      rangeEnd: "2026-07-08T00:00:00.000Z",
    });

    expect(growth.views.value).toBe(-6);
  });

  it("returns unavailable instead of zero when no baseline exists", () => {
    const growth = getSocialAnalyticsGrowthMetricSet({
      platform: "instagram",
      snapshots: [
        createSnapshot("2026-07-08T00:00:00.000Z", {
          views: 145,
          likes: 28,
        }),
      ],
      rangeStart: "2026-07-01T00:00:00.000Z",
      rangeEnd: "2026-07-08T00:00:00.000Z",
    });

    expect(growth.views).toMatchObject({
      value: null,
      currentValue: 145,
      baselineValue: null,
      baselineCapturedAt: null,
    });
    expect(growth.likes.value).toBeNull();
  });
});
