import { describe, expect, it, vi } from "vitest";

async function importQueries() {
  return import("@/lib/content/queries");
}

describe("content blog queries", () => {
  it("returns published blog posts sorted by newest update/date first", async () => {
    const { getPublishedBlogPosts } = await importQueries();
    const posts = getPublishedBlogPosts();

    expect(posts.length).toBeGreaterThan(0);
    expect(posts.every((post) => !post.draft)).toBe(true);

    const timestamps = posts.map((post) =>
      new Date(post.updated ?? post.date).getTime(),
    );
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });

  it("finds featured posts, categories, and posts by slug", async () => {
    const {
      getBlogCategories,
      getBlogPostBySlug,
      getFeaturedBlogPosts,
      getPublishedBlogPosts,
    } = await importQueries();
    const posts = getPublishedBlogPosts();
    const firstPost = posts[0];

    expect(getFeaturedBlogPosts().every((post) => post.featured)).toBe(true);
    expect(getBlogCategories()).toEqual(
      Array.from(new Set(posts.map((post) => post.category))).sort(),
    );

    if (!firstPost) {
      throw new Error("Expected seeded blog content to exist.");
    }

    expect(getBlogPostBySlug(firstPost.slug)?.slug).toBe(firstPost.slug);
    expect(getBlogPostBySlug("missing-post")).toBeUndefined();
  });

  it("combines explicit and inferred related blog posts without duplicates", async () => {
    vi.resetModules();
    vi.doMock("content-collections", () => ({
      allBlogs: [
        {
          category: "strategy",
          date: "2026-01-01",
          draft: false,
          featured: false,
          relatedSlugs: ["explicit", "same-keyword"],
          slug: "source",
          tags: ["ugc", "ads"],
          targetKeyword: "ugc",
        },
        {
          category: "strategy",
          date: "2026-01-02",
          draft: false,
          featured: false,
          relatedSlugs: [],
          slug: "explicit",
          tags: ["ugc"],
          targetKeyword: "creator ads",
        },
        {
          category: "operations",
          date: "2026-01-03",
          draft: false,
          featured: true,
          relatedSlugs: [],
          slug: "same-keyword",
          tags: ["analytics"],
          targetKeyword: "ugc",
        },
        {
          category: "strategy",
          date: "2026-01-04",
          draft: false,
          featured: false,
          relatedSlugs: [],
          slug: "inferred",
          tags: ["ads"],
          targetKeyword: "other",
        },
        {
          category: "strategy",
          date: "2026-01-05",
          draft: true,
          featured: false,
          relatedSlugs: [],
          slug: "draft",
          tags: ["ugc"],
          targetKeyword: "ugc",
        },
      ],
    }));

    const { getBlogPostBySlug, getRelatedBlogPosts } = await importQueries();
    const post = getBlogPostBySlug("source");

    if (!post) {
      throw new Error("Expected mocked source post.");
    }

    const related = getRelatedBlogPosts(post, 3);

    expect(related.map((candidate) => candidate.slug)).toEqual([
      "explicit",
      "same-keyword",
      "inferred",
    ]);
  });
});
