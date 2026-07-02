import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncManualContentAnalyticsForAccount } from "@/lib/clipstitchr/server/apify/syncManualContentAnalyticsForAccount";

describe("syncManualContentAnalyticsForAccount", () => {
  beforeEach(() => {
    vi.stubEnv("APIFY_TOKEN", "token_1");
    vi.stubEnv("APIFY_TIKTOK_PROFILE_ACTOR_ID", "creator/tiktok-profile");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("parses valid actor rows and skips invalid manual analytics rows", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json([
        {
          createTime: 1767225600,
          diggCount: 42,
          id: "735",
          playCount: 1200,
          shareCount: 9,
          text: "Launch day",
          webVideoUrl: "https://www.tiktok.com/@creator/video/735",
        },
        {
          createTime: Number.MAX_VALUE,
          id: "bad_timestamp",
        },
        {
          text: "Missing identity",
        },
      ]),
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await syncManualContentAnalyticsForAccount(
      {
        id: 17,
        platform: "tiktok",
        username: "@creator",
      },
      "2026-01-01T00:00:00.000Z",
    );

    expect(result.failedAccountCount).toBe(0);
    expect(result.skippedItemCount).toBe(2);
    expect(result.analytics).toEqual([
      expect.objectContaining({
        account_username: "creator",
        analytics_source: "manual",
        id: "manual:tiktok:17:735",
        platform: "tiktok",
        platform_post_id: "735",
        view_count: 1200,
      }),
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.apify.com/v2/acts/creator~tiktok-profile/run-sync-get-dataset-items?token=token_1&format=json&clean=true",
      expect.objectContaining({
        body: JSON.stringify({
          profiles: ["creator"],
          resultsPerPage: 30,
          shouldDownloadCovers: false,
          shouldDownloadSlideshowImages: false,
          shouldDownloadSubtitles: false,
          shouldDownloadVideos: false,
        }),
        method: "POST",
      }),
    );
  });

  it("keeps Apify account failures out of the route-level exception path", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 500 })),
    );

    const result = await syncManualContentAnalyticsForAccount(
      {
        id: 17,
        platform: "tiktok",
        username: "creator",
      },
      "2026-01-01T00:00:00.000Z",
    );

    expect(result).toEqual({
      analytics: [],
      failedAccountCount: 1,
      skippedItemCount: 0,
    });
  });
});
