import { describe, expect, it } from "vitest";
import { getPublishedBlogPosts } from "@/lib/content/queries";
import { createContentStructuredData } from "@/lib/content/createContentStructuredData";

describe("createContentStructuredData", () => {
  it("combines the blog post, breadcrumb, and any FAQ into one graph", () => {
    const post = getPublishedBlogPosts()[0];

    if (!post) {
      throw new Error("Expected seeded blog content to exist");
    }

    const data = createContentStructuredData(post);

    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@graph"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ "@type": "BlogPosting", url: post.canonical }),
        expect.objectContaining({ "@type": "BreadcrumbList" }),
      ]),
    );
  });
});
