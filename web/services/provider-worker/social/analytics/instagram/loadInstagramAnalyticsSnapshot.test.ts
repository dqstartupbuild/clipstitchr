import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadInstagramAnalyticsSnapshot } from "./loadInstagramAnalyticsSnapshot";

const mocks = vi.hoisted(() => ({
  fetchInstagramInsightMetric: vi.fn(),
  fetchInstagramMediaMetadata: vi.fn(),
}));

vi.mock("./fetchInstagramInsightMetric", () => ({
  fetchInstagramInsightMetric: mocks.fetchInstagramInsightMetric,
}));
vi.mock("./fetchInstagramMediaMetadata", () => ({
  fetchInstagramMediaMetadata: mocks.fetchInstagramMediaMetadata,
}));

describe("loadInstagramAnalyticsSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchInstagramMediaMetadata.mockResolvedValue({
      mediaType: "VIDEO",
      mediaProductType: "REELS",
      likeCount: 10,
      commentsCount: 3,
    });
    mocks.fetchInstagramInsightMetric.mockImplementation(
      async (_id: string, metric: string) => {
        if (metric === "saved") {
          throw new Error("Unsupported");
        }

        return metric === "ig_reels_video_view_total_time" ? 5_000 : 20;
      },
    );
  });

  it("keeps supported metrics when one insight is unavailable", async () => {
    const snapshot = await loadInstagramAnalyticsSnapshot("media_1", "token");
    const availability = JSON.parse(snapshot.availabilityJson);

    expect(snapshot.views).toBe(20);
    expect(snapshot.likes).toBe(10);
    expect(snapshot.saves).toBeNull();
    expect(snapshot.watchTimeSeconds).toBe(5);
    expect(availability.unavailable).toContain("saved");
  });
});
