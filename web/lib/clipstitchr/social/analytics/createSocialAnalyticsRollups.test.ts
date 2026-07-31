import { describe, expect, it } from "vitest";
import { createSocialAnalyticsRollups } from "./createSocialAnalyticsRollups";
import type { SocialAnalyticsMetricName } from "./SocialAnalyticsMetricName";

function createMetrics(
  values: Partial<Record<SocialAnalyticsMetricName, number | null>>,
) {
  return {
    views: null,
    reach: null,
    likes: null,
    comments: null,
    shares: null,
    saves: null,
    watchTimeSeconds: null,
    ...values,
  };
}

describe("createSocialAnalyticsRollups", () => {
  it("groups publications and preserves missing metrics as unavailable", () => {
    const rollups = createSocialAnalyticsRollups([
      {
        groupId: "post_1",
        groupLabel: "Launch post",
        metrics: createMetrics({ likes: 4, views: 100 }),
      },
      {
        groupId: "post_1",
        groupLabel: "Launch post",
        metrics: createMetrics({ likes: null, views: 75 }),
      },
      {
        groupId: "post_2",
        groupLabel: "Follow-up post",
        metrics: createMetrics({ comments: 3 }),
      },
    ]);

    expect(rollups).toEqual([
      expect.objectContaining({
        id: "post_1",
        label: "Launch post",
        publicationCount: 2,
        metrics: expect.objectContaining({
          views: { value: 175, availableCount: 2, totalCount: 2 },
          likes: { value: 4, availableCount: 1, totalCount: 2 },
          saves: { value: null, availableCount: 0, totalCount: 2 },
        }),
      }),
      expect.objectContaining({
        id: "post_2",
        label: "Follow-up post",
        publicationCount: 1,
        metrics: expect.objectContaining({
          comments: { value: 3, availableCount: 1, totalCount: 1 },
          views: { value: null, availableCount: 0, totalCount: 1 },
        }),
      }),
    ]);
  });
});
