import { describe, expect, it } from "vitest";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";
import { getPostBridgePostTimeLabel } from "@/lib/clipstitchr/utils/getPostBridgePostTimeLabel";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function createPost(overrides: Partial<PostBridgePost> = {}): PostBridgePost {
  return {
    caption: "Post",
    created_at: "2026-06-27T14:30:00.000Z",
    id: "post_1",
    is_draft: false,
    scheduled_at: "2026-06-28T15:00:00.000Z",
    social_accounts: [1],
    status: "scheduled",
    updated_at: "2026-06-27T14:31:00.000Z",
    ...overrides,
  };
}

describe("getPostBridgePostTimeLabel", () => {
  it("shows scheduled time when Post Bridge returns scheduled_at", () => {
    expect(getPostBridgePostTimeLabel(createPost())).toBe(
      `Scheduled ${formatDate("2026-06-28T15:00:00.000Z")}`,
    );
  });

  it("shows created time for immediate posted rows", () => {
    expect(
      getPostBridgePostTimeLabel(
        createPost({
          scheduled_at: null,
          status: "posted",
        }),
      ),
    ).toBe(`Posted ${formatDate("2026-06-27T14:30:00.000Z")}`);
  });

  it("falls back to updated time when created time is invalid", () => {
    expect(
      getPostBridgePostTimeLabel(
        createPost({
          created_at: "",
          scheduled_at: null,
          status: "failed",
        }),
      ),
    ).toBe(`Updated ${formatDate("2026-06-27T14:31:00.000Z")}`);
  });

  it("shows a clear empty label when no Post Bridge time is usable", () => {
    expect(
      getPostBridgePostTimeLabel(
        createPost({
          created_at: "",
          scheduled_at: null,
          updated_at: "",
        }),
      ),
    ).toBe("No time available");
  });
});
