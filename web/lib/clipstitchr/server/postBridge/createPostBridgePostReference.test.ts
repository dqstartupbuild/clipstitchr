import { describe, expect, it } from "vitest";
import { createPostBridgePostReference } from "@/lib/clipstitchr/server/postBridge/createPostBridgePostReference";

describe("createPostBridgePostReference", () => {
  it("stores the scheduled media kind", () => {
    expect(
      createPostBridgePostReference({
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
          social_accounts: [1],
          status: "scheduled",
          updated_at: "2026-06-26T00:00:00.000Z",
        },
        scheduledAt: "2026-06-27T12:00:00.000Z",
        socialAccountIds: [1],
        sourceType: "swipe",
      }).mediaKind,
    ).toBe("image");
  });

  it("omits scheduledAt for immediate posts", () => {
    expect(
      createPostBridgePostReference({
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
          social_accounts: [1],
          status: "processing",
          updated_at: "2026-06-26T00:00:00.000Z",
        },
        scheduledAt: null,
        socialAccountIds: [1],
        sourceType: "stitch",
      }).scheduledAt,
    ).toBeUndefined();
  });
});
