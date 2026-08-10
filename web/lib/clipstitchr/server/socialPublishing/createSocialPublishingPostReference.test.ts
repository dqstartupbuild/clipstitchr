import { describe, expect, it } from "vitest";
import { createSocialPublishingPostReference } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingPostReference";

describe("createSocialPublishingPostReference", () => {
  it("stores the scheduled media kind", () => {
    expect(
      createSocialPublishingPostReference({
        hasAudio: false,
        mediaIds: ["media_1", "media_2"],
        mediaKind: "image",
        platforms: ["tiktok", "instagram"],
        post: {
          caption: "Launch",
          created_at: "2026-06-26T00:00:00.000Z",
          id: "post_1",
          is_draft: false,
          scheduled_at: null,
          social_accounts: ["account_1"],
          status: "scheduled",
          updated_at: "2026-06-26T00:00:00.000Z",
        },
        scheduledAt: "2026-06-27T12:00:00.000Z",
        socialAccountIds: ["account_1"],
        sourceType: "swipe",
      }).mediaKind,
    ).toBe("image");
  });

  it("omits scheduledAt for immediate posts", () => {
    expect(
      createSocialPublishingPostReference({
        hasAudio: true,
        mediaIds: ["media_1"],
        mediaKind: "video",
        platforms: ["tiktok"],
        post: {
          caption: "Launch",
          created_at: "2026-06-26T00:00:00.000Z",
          id: "post_1",
          is_draft: false,
          scheduled_at: null,
          social_accounts: ["account_1"],
          status: "processing",
          updated_at: "2026-06-26T00:00:00.000Z",
        },
        scheduledAt: null,
        socialAccountIds: ["account_1"],
        sourceType: "stitch",
      }).scheduledAt,
    ).toBeUndefined();
  });

  it("stores the scheduled_at returned by Zernio for queued posts", () => {
    expect(
      createSocialPublishingPostReference({
        hasAudio: false,
        mediaIds: ["media_1"],
        mediaKind: "video",
        platforms: ["instagram"],
        post: {
          caption: "Launch",
          created_at: "2026-06-26T00:00:00.000Z",
          id: "post_1",
          is_draft: false,
          scheduled_at: "2026-06-28T15:00:00.000Z",
          social_accounts: ["account_1"],
          status: "scheduled",
          updated_at: "2026-06-26T00:00:00.000Z",
        },
        scheduledAt: null,
        socialAccountIds: ["account_1"],
        sourceType: "swipe",
      }).scheduledAt,
    ).toBe("2026-06-28T15:00:00.000Z");
  });
});
