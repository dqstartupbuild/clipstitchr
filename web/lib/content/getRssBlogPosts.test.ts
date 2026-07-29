import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchConvexBlogPostCards: vi.fn(),
  getPublishedBlogPosts: vi.fn(),
}));

vi.mock("@/lib/content/queries", () => ({
  getPublishedBlogPosts: mocks.getPublishedBlogPosts,
}));

vi.mock("@/lib/content/runtimeBlog/fetchConvexBlogPostCards", () => ({
  fetchConvexBlogPostCards: mocks.fetchConvexBlogPostCards,
}));

import { getRssBlogPosts } from "./getRssBlogPosts";
import { createRssXml } from "./seo";

describe("getRssBlogPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublishedBlogPosts.mockReturnValue([]);
  });

  it("includes webhook posts and their separate seo titles in the feed", async () => {
    mocks.fetchConvexBlogPostCards.mockResolvedValue([
      {
        slug: "runtime-blog",
        title: "Visible Runtime Blog Title",
        seoTitle:
          "Runtime Blog SEO Title With Clear Search Intent and Next Steps",
        metaDescription: "A short summary.",
        tags: ["keyword"],
        source: "Blogr",
        readingTimeMinutes: 1,
        publishedAt: "2026-06-23T16:00:00.000Z",
        createdAt: "2026-06-23T15:30:00.000Z",
        updatedAt: "2026-07-29T18:00:00.000Z",
      },
    ]);

    const posts = await getRssBlogPosts();
    const xml = createRssXml(posts);

    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      title: "Visible Runtime Blog Title",
      seoTitle:
        "Runtime Blog SEO Title With Clear Search Intent and Next Steps",
      canonical: "http://localhost:3000/blog/runtime-blog",
    });
    expect(xml).toContain(
      "<title>Runtime Blog SEO Title With Clear Search Intent and Next Steps</title>",
    );
  });
});
