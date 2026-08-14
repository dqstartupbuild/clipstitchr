import { describe, expect, it } from "vitest";
import { createSocialPublishingPerformanceChartSeries } from "@/lib/clipstitchr/utils/createSocialPublishingPerformanceChartSeries";

describe("createSocialPublishingPerformanceChartSeries", () => {
  it("creates visible view and interaction paths from daily metrics", () => {
    const series = createSocialPublishingPerformanceChartSeries([
      {
        date: "2026-08-01",
        metrics: {
          clicks: 1,
          comments: 2,
          impressions: 20,
          likes: 3,
          reach: 18,
          saves: 4,
          shares: 5,
          views: 100,
        },
        postCount: 1,
      },
      {
        date: "2026-08-02",
        metrics: {
          clicks: 0,
          comments: 1,
          impressions: 40,
          likes: 6,
          reach: 30,
          saves: 2,
          shares: 1,
          views: 200,
        },
        postCount: 1,
      },
    ]);

    expect(series).toEqual(
      expect.objectContaining({
        firstDate: "2026-08-01",
        lastDate: "2026-08-02",
        maxValue: 200,
      }),
    );
    expect(series?.viewPoints).toContain("24.0");
    expect(series?.engagementPoints).toContain("696.0");
  });
});
