import { describe, expect, it } from "vitest";
import { normalizeBlogArticle } from "./normalizeBlogArticle";

const baseArticle = {
  id: "blog-id",
  title: "A Helpful Blog Title",
  slug: "a-helpful-blog-title",
  meta_description: "A short plain-language summary.",
  content_format: "mdx",
  content_markdown: "# Markdown body",
  content_mdx: "# MDX body",
  content_html: "",
  image_url: "https://example.com/image.jpg",
  tags: ["keyword", "keyword", " spaced "],
  source: "Blogger",
  created_at: "2026-06-23T15:30:00.000Z",
  updated_at: "2026-06-23T15:45:00.000Z",
};

describe("normalizeBlogArticle", () => {
  it("uses content_mdx as the source of truth", () => {
    const normalized = normalizeBlogArticle(baseArticle);

    expect(normalized.contentFormat).toBe("mdx");
    expect(normalized.content).toBe("# MDX body");
  });

  it("falls back to content_markdown when mdx is absent", () => {
    const normalized = normalizeBlogArticle({
      ...baseArticle,
      content_mdx: "",
    });

    expect(normalized.contentFormat).toBe("markdown");
    expect(normalized.content).toBe("# Markdown body");
  });

  it("falls back to content_html when mdx and markdown are absent", () => {
    const normalized = normalizeBlogArticle({
      ...baseArticle,
      content_mdx: "",
      content_markdown: "",
      content_html: "<p>HTML body</p>",
    });

    expect(normalized.contentFormat).toBe("html");
    expect(normalized.content).toBe("<p>HTML body</p>");
  });

  it("derives a slug from the title when slug is missing", () => {
    const normalized = normalizeBlogArticle({
      ...baseArticle,
      slug: undefined,
    });

    expect(normalized.slug).toBe("a-helpful-blog-title");
  });

  it("deduplicates and trims tags", () => {
    const normalized = normalizeBlogArticle(baseArticle);

    expect(normalized.tags).toEqual(["keyword", "spaced"]);
  });

  it("ignores image urls that are not absolute http urls", () => {
    const normalized = normalizeBlogArticle({
      ...baseArticle,
      image_url: "not-a-url",
    });

    expect(normalized.imageUrl).toBeUndefined();
  });

  it("throws when there is no publishable content", () => {
    expect(() =>
      normalizeBlogArticle({
        ...baseArticle,
        content_mdx: "",
        content_markdown: "",
        content_html: "",
      }),
    ).toThrow("The article is missing publishable content.");
  });
});
