import { beforeEach, describe, expect, it, vi } from "vitest";
import { enrichTikTokSaves } from "./enrichTikTokSaves";

const mocks = vi.hoisted(() => ({
  getSocialAnalyticsApifyDatasetItems: vi.fn(),
  getSocialAnalyticsApifyMaxTotalChargeUsd: vi.fn(),
  getSocialAnalyticsApifyUrlLimit: vi.fn(),
  startSocialAnalyticsApifyRun: vi.fn(),
  waitForSocialAnalyticsApifyRun: vi.fn(),
}));

vi.mock("./getSocialAnalyticsApifyDatasetItems", () => ({
  getSocialAnalyticsApifyDatasetItems:
    mocks.getSocialAnalyticsApifyDatasetItems,
}));
vi.mock("./getSocialAnalyticsApifyMaxTotalChargeUsd", () => ({
  getSocialAnalyticsApifyMaxTotalChargeUsd:
    mocks.getSocialAnalyticsApifyMaxTotalChargeUsd,
}));
vi.mock("./getSocialAnalyticsApifyUrlLimit", () => ({
  getSocialAnalyticsApifyUrlLimit: mocks.getSocialAnalyticsApifyUrlLimit,
}));
vi.mock("./startSocialAnalyticsApifyRun", () => ({
  startSocialAnalyticsApifyRun: mocks.startSocialAnalyticsApifyRun,
}));
vi.mock("./waitForSocialAnalyticsApifyRun", () => ({
  waitForSocialAnalyticsApifyRun: mocks.waitForSocialAnalyticsApifyRun,
}));

describe("enrichTikTokSaves", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSocialAnalyticsApifyUrlLimit.mockReturnValue(1);
    mocks.getSocialAnalyticsApifyMaxTotalChargeUsd.mockReturnValue(0.5);
    mocks.startSocialAnalyticsApifyRun.mockResolvedValue({ id: "run_1" });
    mocks.waitForSocialAnalyticsApifyRun.mockResolvedValue({
      defaultDatasetId: "dataset_1",
    });
    mocks.getSocialAnalyticsApifyDatasetItems.mockResolvedValue([
      { id: "video_1", collectCount: 12 },
    ]);
  });

  it("uses one bounded run and returns only public save counts", async () => {
    const result = await enrichTikTokSaves([
      {
        externalPublicationId: "video_1",
        username: "creator",
      },
      {
        externalPublicationId: "video_2",
        username: "creator",
      },
    ]);

    expect(mocks.startSocialAnalyticsApifyRun).toHaveBeenCalledWith({
      postUrls: ["https://www.tiktok.com/@creator/video/video_1"],
      maxTotalChargeUsd: 0.5,
    });
    expect(result.runCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(result.savesByExternalId.get("video_1")).toBe(12);
  });

  it("surfaces enrichment failure so the caller can retain official data", async () => {
    mocks.waitForSocialAnalyticsApifyRun.mockRejectedValue(
      new Error("Actor failed"),
    );

    await expect(
      enrichTikTokSaves([
        { externalPublicationId: "video_1", username: "creator" },
      ]),
    ).rejects.toThrow("Actor failed");
  });
});
