import { afterEach, describe, expect, it, vi } from "vitest";
import { getSocialAnalyticsGrowthMetricSet } from "@/lib/clipstitchr/social/analytics/getSocialAnalyticsGrowthMetricSet";
import { getLatestSocialAnalyticsMetricSet } from "@/lib/clipstitchr/social/analytics/getLatestSocialAnalyticsMetricSet";
import { createUnavailableSocialAnalyticsSnapshot } from "./analytics/createUnavailableSocialAnalyticsSnapshot";
import { getSocialAnalyticsApifyMaxTotalChargeUsd } from "./analytics/apify/getSocialAnalyticsApifyMaxTotalChargeUsd";
import { getInstagramInsightMetricNames } from "./analytics/instagram/getInstagramInsightMetricNames";
import { queryTikTokVideoAnalytics } from "./analytics/tiktok/queryTikTokVideoAnalytics";

const originalCap =
  process.env.SOCIAL_ANALYTICS_APIFY_MAX_TOTAL_CHARGE_USD;

describe("social analytics metrics", () => {
  afterEach(() => {
    process.env.SOCIAL_ANALYTICS_APIFY_MAX_TOTAL_CHARGE_USD = originalCap;
    vi.unstubAllGlobals();
  });

  it("keeps missing metrics null and does not invent a baseline", () => {
    const unavailable = createUnavailableSocialAnalyticsSnapshot(
      "tiktok_official",
      "No public ID",
    );
    const growth = getSocialAnalyticsGrowthMetricSet({
      platform: "tiktok",
      snapshots: [
        {
          ...unavailable,
          capturedAt: "2026-08-02T00:00:00.000Z",
        },
      ],
      rangeStart: "2026-08-01T00:00:00.000Z",
      rangeEnd: "2026-08-03T00:00:00.000Z",
    });

    expect(growth.views.value).toBeNull();
    expect(growth.views.baselineValue).toBeNull();
  });

  it("allows signed corrections and uses Apify only for TikTok saves", () => {
    const snapshots = [
      {
        source: "tiktok_official",
        capturedAt: "2026-08-01T00:00:00.000Z",
        views: 100,
        reach: null,
        likes: 20,
        comments: 5,
        shares: 3,
        saves: null,
        watchTimeSeconds: null,
      },
      {
        source: "tiktok_official",
        capturedAt: "2026-08-02T00:00:00.000Z",
        views: 90,
        reach: null,
        likes: 22,
        comments: 5,
        shares: 4,
        saves: null,
        watchTimeSeconds: null,
      },
      {
        source: "apify_public",
        capturedAt: "2026-08-02T00:00:00.000Z",
        views: 999,
        reach: null,
        likes: 999,
        comments: 999,
        shares: 999,
        saves: 8,
        watchTimeSeconds: null,
      },
    ];
    const growth = getSocialAnalyticsGrowthMetricSet({
      platform: "tiktok",
      snapshots,
      rangeStart: "2026-08-01T00:00:00.000Z",
      rangeEnd: "2026-08-02T00:00:00.000Z",
    });
    const latest = getLatestSocialAnalyticsMetricSet({
      platform: "tiktok",
      snapshots,
    });

    expect(growth.views.value).toBe(-10);
    expect(latest.views.value).toBe(90);
    expect(latest.saves.value).toBe(8);
  });

  it("selects Instagram insight metrics by media type", () => {
    const imageMetrics = getInstagramInsightMetricNames({
      mediaType: "IMAGE",
      mediaProductType: "FEED",
      likeCount: 1,
      commentsCount: 1,
    });
    const reelMetrics = getInstagramInsightMetricNames({
      mediaType: "VIDEO",
      mediaProductType: "REELS",
      likeCount: 1,
      commentsCount: 1,
    });

    expect(imageMetrics).not.toContain("ig_reels_video_view_total_time");
    expect(reelMetrics).toContain("ig_reels_video_view_total_time");
  });

  it("enforces TikTok's 20-ID analytics batch limit", async () => {
    await expect(
      queryTikTokVideoAnalytics(
        "token",
        Array.from({ length: 21 }, (_, index) => String(index)),
      ),
    ).rejects.toThrow("1 to 20");
  });

  it("clamps optional Apify enrichment cost", () => {
    process.env.SOCIAL_ANALYTICS_APIFY_MAX_TOTAL_CHARGE_USD = "99";
    expect(getSocialAnalyticsApifyMaxTotalChargeUsd()).toBe(2);
    process.env.SOCIAL_ANALYTICS_APIFY_MAX_TOTAL_CHARGE_USD = "0.01";
    expect(getSocialAnalyticsApifyMaxTotalChargeUsd()).toBe(0.5);
  });
});
