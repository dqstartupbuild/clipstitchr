import { describe, expect, it } from "vitest";
import { getLatestSocialPublishingAnalyticsSyncedAtMs } from "@/lib/clipstitchr/server/socialPublishing/getLatestSocialPublishingAnalyticsSyncedAtMs";
import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

function createAnalytics(lastSyncedAt: string) {
  return { last_synced_at: lastSyncedAt } as SocialPublishingAnalytics;
}

describe("getLatestSocialPublishingAnalyticsSyncedAtMs", () => {
  it("returns null when there are no analytics rows", () => {
    expect(getLatestSocialPublishingAnalyticsSyncedAtMs([])).toBeNull();
  });

  it("returns the latest parseable last_synced_at across rows", () => {
    const analytics = [
      createAnalytics("2026-07-01T00:00:00.000Z"),
      createAnalytics("not-a-date"),
      createAnalytics("2026-07-03T12:30:00.000Z"),
      createAnalytics("2026-07-02T06:00:00.000Z"),
    ];

    expect(getLatestSocialPublishingAnalyticsSyncedAtMs(analytics)).toBe(
      Date.parse("2026-07-03T12:30:00.000Z"),
    );
  });

  it("returns null when no row has a parseable last_synced_at", () => {
    expect(
      getLatestSocialPublishingAnalyticsSyncedAtMs([createAnalytics("nope")]),
    ).toBeNull();
  });
});
