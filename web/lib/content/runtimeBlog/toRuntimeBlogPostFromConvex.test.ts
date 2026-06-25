import { describe, expect, it } from "vitest";
import {
  toRuntimeBlogPostFromConvex,
  type ConvexBlogPost,
} from "./toRuntimeBlogPostFromConvex";

const basePost: ConvexBlogPost = {
  slug: "a-helpful-blog-title",
  title: "A Helpful Blog Title",
  metaDescription: "A short plain-language summary.",
  contentFormat: "markdown",
  content: "# Heading\n\nBody paragraph with several words to count.",
  contentHtml: undefined,
  imageUrl: "https://example.com/image.jpg",
  tags: ["keyword"],
  source: "Blogger",
  publishedAt: "2026-06-23T16:00:00.000Z",
  createdAt: "2026-06-23T15:30:00.000Z",
  updatedAt: "2026-06-23T15:45:00.000Z",
};

describe("toRuntimeBlogPostFromConvex", () => {
  it("maps a convex post into a runtime blog post", () => {
    const runtimePost = toRuntimeBlogPostFromConvex(basePost);

    expect(runtimePost.slug).toBe("a-helpful-blog-title");
    expect(runtimePost.url).toBe("/blog/a-helpful-blog-title");
    expect(runtimePost.title).toBe("A Helpful Blog Title");
    expect(runtimePost.description).toBe("A short plain-language summary.");
    expect(runtimePost.image).toBe("https://example.com/image.jpg");
    expect(runtimePost.source).toBe("convex");
    expect(runtimePost.bodyHtml).toContain('<h1 id="heading">Heading</h1>');
    expect(runtimePost.date).toBe("2026-06-23");
    expect(runtimePost.readingTimeMinutes).toBeGreaterThanOrEqual(1);
  });

  it("falls back to a default author and category when source is absent", () => {
    const runtimePost = toRuntimeBlogPostFromConvex({
      ...basePost,
      source: undefined,
    });

    expect(runtimePost.author).toBe("ClipStitchr");
    expect(runtimePost.category).toBe("Articles");
  });
});
