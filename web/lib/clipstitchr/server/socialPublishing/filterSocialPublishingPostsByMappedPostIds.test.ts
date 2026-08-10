import { describe, expect, it } from "vitest";
import { filterSocialPublishingPostsByMappedPostIds } from "@/lib/clipstitchr/server/socialPublishing/filterSocialPublishingPostsByMappedPostIds";
import type { SocialPublishingPost } from "@/lib/clipstitchr/types/SocialPublishingPost";

function createPost(id: string): SocialPublishingPost {
  return {
    caption: `Post ${id}`,
    created_at: "2026-06-20T00:00:00.000Z",
    id,
    is_draft: false,
    scheduled_at: null,
    social_accounts: ["account_101"],
    status: "scheduled",
    updated_at: "2026-06-20T00:00:00.000Z",
  };
}

describe("filterSocialPublishingPostsByMappedPostIds", () => {
  it("keeps only posts mapped to the active product", () => {
    expect(
      filterSocialPublishingPostsByMappedPostIds(
        [createPost("post_1"), createPost("post_2"), createPost("post_3")],
        ["post_2", "post_3"],
      ).map((post) => post.id),
    ).toEqual(["post_2", "post_3"]);
  });
});
