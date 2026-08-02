import { beforeEach, describe, expect, it, vi } from "vitest";
import { listPostBridgeAnalytics } from "@/lib/clipstitchr/server/postBridge/listPostBridgeAnalytics";
import { syncPostBridgeAnalytics } from "@/lib/clipstitchr/server/postBridge/syncPostBridgeAnalytics";
import { waitForPostBridgeAnalyticsSync } from "@/lib/clipstitchr/server/postBridge/waitForPostBridgeAnalyticsSync";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

vi.mock("@/lib/clipstitchr/server/postBridge/listPostBridgeAnalytics", () => ({
  listPostBridgeAnalytics: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/postBridge/syncPostBridgeAnalytics", () => ({
  syncPostBridgeAnalytics: vi.fn(),
}));

const listPostBridgeAnalyticsMock = vi.mocked(listPostBridgeAnalytics);
const syncPostBridgeAnalyticsMock = vi.mocked(syncPostBridgeAnalytics);

function createAnalytics(lastSyncedAt: string) {
  return { last_synced_at: lastSyncedAt } as PostBridgeAnalytics;
}

describe("waitForPostBridgeAnalyticsSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    syncPostBridgeAnalyticsMock.mockResolvedValue(undefined);
  });

  it("syncs once and returns as soon as the probe advances", async () => {
    listPostBridgeAnalyticsMock
      .mockResolvedValueOnce([createAnalytics("2026-07-01T00:00:00.000Z")])
      .mockResolvedValueOnce([createAnalytics("2026-07-02T00:00:00.000Z")]);

    const result = await waitForPostBridgeAnalyticsSync(
      "pb_key",
      ["result_1"],
      { pollIntervalMs: 0 },
    );

    expect(syncPostBridgeAnalyticsMock).toHaveBeenCalledOnce();
    expect(syncPostBridgeAnalyticsMock).toHaveBeenCalledWith("pb_key");
    expect(listPostBridgeAnalyticsMock).toHaveBeenCalledTimes(2);
    expect(result).toBe(Date.parse("2026-07-02T00:00:00.000Z"));
  });

  it("keeps polling until maxPolls when the probe never advances", async () => {
    listPostBridgeAnalyticsMock.mockResolvedValue([
      createAnalytics("2026-07-01T00:00:00.000Z"),
    ]);

    const result = await waitForPostBridgeAnalyticsSync(
      "pb_key",
      ["result_1"],
      { maxPolls: 3, pollIntervalMs: 0 },
    );

    expect(listPostBridgeAnalyticsMock).toHaveBeenCalledTimes(4);
    expect(result).toBe(Date.parse("2026-07-01T00:00:00.000Z"));
  });

  it("treats the first non-null probe as advanced when there was no baseline", async () => {
    listPostBridgeAnalyticsMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([createAnalytics("2026-07-02T00:00:00.000Z")]);

    const result = await waitForPostBridgeAnalyticsSync("pb_key", ["result_1"], {
      pollIntervalMs: 0,
    });

    expect(result).toBe(Date.parse("2026-07-02T00:00:00.000Z"));
  });

  it("probes with only the first 100 post result ids", async () => {
    const postResultIds = Array.from(
      { length: 150 },
      (_, index) => `result_${index}`,
    );
    listPostBridgeAnalyticsMock.mockResolvedValue([]);

    await waitForPostBridgeAnalyticsSync("pb_key", postResultIds, {
      maxPolls: 1,
      pollIntervalMs: 0,
    });

    expect(listPostBridgeAnalyticsMock).toHaveBeenCalledWith(
      "pb_key",
      postResultIds.slice(0, 100),
    );
  });
});
