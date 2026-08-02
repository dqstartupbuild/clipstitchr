import { describe, expect, it } from "vitest";
import { filterPostBridgePostsByMappedPostIds } from "@/lib/clipstitchr/server/postBridge/filterPostBridgePostsByMappedPostIds";
import type { PostBridgePost } from "@/lib/clipstitchr/types/PostBridgePost";

function createPost(id: string): PostBridgePost {
  return {
    caption: `Post ${id}`,
    created_at: "2026-06-20T00:00:00.000Z",
    id,
    is_draft: false,
    scheduled_at: null,
    social_accounts: [101],
    status: "scheduled",
    updated_at: "2026-06-20T00:00:00.000Z",
  };
}

describe("filterPostBridgePostsByMappedPostIds", () => {
  it("keeps only posts mapped to the active product", () => {
    expect(
      filterPostBridgePostsByMappedPostIds(
        [createPost("post_1"), createPost("post_2"), createPost("post_3")],
        ["post_2", "post_3"],
      ).map((post) => post.id),
    ).toEqual(["post_2", "post_3"]);
  });
});
