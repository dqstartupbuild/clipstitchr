import { describe, expect, it } from "vitest";
import { getPublishedBlogPosts } from "@/lib/content/queries";
import {
  createArticleJsonLd,
  createContentMetadata,
  createFaqJsonLd,
  createRssXml,
} from "@/lib/content/seo";

describe("content SEO helpers", () => {
  const post = getPublishedBlogPosts()[0];

  it("creates article metadata from a blog post", () => {
    if (!post) {
      throw new Error("Expected seeded blog content to exist");
    }

    const metadata = createContentMetadata(post);

    expect(metadata.alternates?.canonical).toBe(post.canonical);
    expect(metadata.openGraph).toMatchObject({
      type: "article",
    });
  });

  it("creates article JSON-LD and conditionally creates FAQ JSON-LD", () => {
    if (!post) {
      throw new Error("Expected seeded blog content to exist");
    }

    const article = createArticleJsonLd(post);
    const faq = createFaqJsonLd(post);

    expect(article["@type"]).toBe("Article");

    if (post.faq?.length) {
      expect(faq?.["@type"]).toBe("FAQPage");
    } else {
      expect(faq).toBeNull();
    }
  });

  it("renders RSS XML for the published posts", () => {
    const xml = createRssXml(getPublishedBlogPosts());

    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain(
      "http://localhost:3000/blog/getting-started",
    );
  });
});
