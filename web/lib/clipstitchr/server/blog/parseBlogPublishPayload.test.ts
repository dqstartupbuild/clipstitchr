import { describe, expect, it } from "vitest";
import { parseBlogPublishPayload } from "./parseBlogPublishPayload";

const baseArticle = {
  id: "blog-id",
  title: "A Helpful Blog Title",
  slug: "a-helpful-blog-title",
  meta_description: "A short plain-language summary.",
  content_format: "mdx",
  content_markdown: "# Article body",
  content_mdx: "# Article body",
  content_html: "",
  image_url: "https://example.com/image.jpg",
  tags: ["keyword"],
  source: "Blogr",
  created_at: "2026-06-23T15:30:00.000Z",
  updated_at: "2026-06-23T15:45:00.000Z",
};

describe("parseBlogPublishPayload", () => {
  it("returns all articles for publish_articles", () => {
    const articles = parseBlogPublishPayload({
      event_type: "publish_articles",
      timestamp: "2026-06-23T16:00:00.000Z",
      data: { articles: [baseArticle, { ...baseArticle, slug: "second" }] },
    });

    expect(articles).toHaveLength(2);
    expect(articles[0].slug).toBe("a-helpful-blog-title");
  });

  it("returns a single article for update_article", () => {
    const articles = parseBlogPublishPayload({
      event_type: "update_article",
      data: { article: baseArticle },
    });

    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe("A Helpful Blog Title");
  });

  it("throws for an unknown event type", () => {
    expect(() =>
      parseBlogPublishPayload({
        event_type: "delete_article",
        data: { article: baseArticle },
      }),
    ).toThrow("Invalid blog publish payload.");
  });

  it("throws when publish_articles has no articles", () => {
    expect(() =>
      parseBlogPublishPayload({
        event_type: "publish_articles",
        data: { articles: [] },
      }),
    ).toThrow("Invalid blog publish payload.");
  });

  it("throws when an article is missing a title", () => {
    expect(() =>
      parseBlogPublishPayload({
        event_type: "update_article",
        data: { article: { ...baseArticle, title: "" } },
      }),
    ).toThrow("Invalid blog publish payload.");
  });
});
