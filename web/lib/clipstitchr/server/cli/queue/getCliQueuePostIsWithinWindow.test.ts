import { describe, expect, it } from "vitest";
import { getCliQueuePostIsWithinWindow } from "@/lib/clipstitchr/server/cli/queue/getCliQueuePostIsWithinWindow";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";

function createPost(overrides: Partial<PostBridgePost> = {}): PostBridgePost {
  return {
    caption: "Caption",
    created_at: "2026-07-09T12:00:00.000Z",
    id: "post_1",
    is_draft: false,
    scheduled_at: null,
    social_accounts: [123],
    status: "scheduled",
    updated_at: "2026-07-09T12:00:00.000Z",
    ...overrides,
  };
}

describe("getCliQueuePostIsWithinWindow", () => {
  it("keeps queued posts without a scheduled time", () => {
    expect(
      getCliQueuePostIsWithinWindow(
        createPost(),
        new Date("2026-07-09T12:00:00.000Z"),
      ),
    ).toBe(true);
  });

  it("keeps scheduled posts inside the next 24 hours", () => {
    expect(
      getCliQueuePostIsWithinWindow(
        createPost({ scheduled_at: "2026-07-10T11:59:00.000Z" }),
        new Date("2026-07-09T12:00:00.000Z"),
      ),
    ).toBe(true);
  });

  it("rejects scheduled posts outside the next 24 hours", () => {
    expect(
      getCliQueuePostIsWithinWindow(
        createPost({ scheduled_at: "2026-07-10T12:01:00.000Z" }),
        new Date("2026-07-09T12:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("rejects finished posts", () => {
    expect(
      getCliQueuePostIsWithinWindow(
        createPost({ status: "posted" }),
        new Date("2026-07-09T12:00:00.000Z"),
      ),
    ).toBe(false);
  });
});
