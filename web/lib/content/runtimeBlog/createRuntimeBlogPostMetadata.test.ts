import { describe, expect, it } from "vitest";
import { createRuntimeBlogPostMetadata } from "./createRuntimeBlogPostMetadata";
import type { RuntimeBlogPost } from "./runtimeBlogPost";

const runtimePost: RuntimeBlogPost = {
  slug: "a-helpful-blog-title",
  url: "/blog/a-helpful-blog-title",
  title: "A Helpful Blog Title",
  seoTitle:
    "A Helpful Blog Title for Search Results With Clear Next Steps",
  description: "A helpful plain-English article summary.",
  category: "Blogr",
  tags: ["content planning"],
  author: "ClipStitchr",
  date: "2026-06-23",
  updated: "2026-07-29",
  readingTimeMinutes: 4,
  bodyHtml: "<p>Article body</p>",
  canonical: "http://localhost:3000/blog/a-helpful-blog-title",
  source: "convex",
};

describe("createRuntimeBlogPostMetadata", () => {
  it("uses the separate seo title without changing the visible title", () => {
    const metadata = createRuntimeBlogPostMetadata(runtimePost);

    expect(metadata.title).toBe(
      "A Helpful Blog Title for Search Results With Clear Next Steps",
    );
    expect(runtimePost.title).toBe("A Helpful Blog Title");
  });
});
