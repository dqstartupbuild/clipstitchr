import { beforeEach, describe, expect, it, vi } from "vitest";
import { copyBlogArticleImages } from "./copyBlogArticleImages";
import type { NormalizedBlogArticle } from "./normalizeBlogArticle";

const mocks = vi.hoisted(() => ({
  copyBlogImageSource: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/blog/copyBlogImageSource", () => ({
  copyBlogImageSource: mocks.copyBlogImageSource,
}));

const baseArticle: NormalizedBlogArticle = {
  slug: "a-helpful-blog-title",
  externalId: "blog-id",
  title: "A Helpful Blog Title",
  seoTitle:
    "A Helpful Blog Title for Search Results With Clear Next Steps",
  metaDescription: "A short plain-language summary.",
  contentFormat: "mdx",
  content: [
    "---",
    'featureImage: "https://blogger.test/feature.png"',
    "---",
    "",
    "# Article body",
    "",
    "![Chart alt](https://blogger.test/chart.jpg)",
    "![Same chart](https://blogger.test/chart.jpg)",
  ].join("\n"),
  imageUrl: "https://blogger.test/hero.jpg",
  tags: ["keyword"],
  source: "Blogr",
  createdAt: "2026-06-23T15:30:00.000Z",
  updatedAt: "2026-06-23T15:45:00.000Z",
};

describe("copyBlogArticleImages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.copyBlogImageSource.mockImplementation(
      async ({ sourceUrl }: { sourceUrl: string }) =>
        `https://clipstitchr.test/stored/${encodeURIComponent(sourceUrl)}`,
    );
  });

  it("copies each unique article image and rewrites saved URLs", async () => {
    const article = await copyBlogArticleImages(baseArticle);

    expect(mocks.copyBlogImageSource).toHaveBeenCalledTimes(3);
    expect(mocks.copyBlogImageSource).toHaveBeenCalledWith({
      slug: "a-helpful-blog-title",
      sourceUrl: "https://blogger.test/hero.jpg",
    });
    expect(mocks.copyBlogImageSource).toHaveBeenCalledWith({
      slug: "a-helpful-blog-title",
      sourceUrl: "https://blogger.test/feature.png",
    });
    expect(mocks.copyBlogImageSource).toHaveBeenCalledWith({
      slug: "a-helpful-blog-title",
      sourceUrl: "https://blogger.test/chart.jpg",
    });
    expect(article.imageUrl).toBe(
      "https://clipstitchr.test/stored/https%3A%2F%2Fblogger.test%2Fhero.jpg",
    );
    expect(article.content).toContain(
      'featureImage: "https://clipstitchr.test/stored/https%3A%2F%2Fblogger.test%2Ffeature.png"',
    );
    expect(article.content).toContain(
      "![Chart alt](https://clipstitchr.test/stored/https%3A%2F%2Fblogger.test%2Fchart.jpg)",
    );
    expect(article.content).not.toContain("https://blogger.test/chart.jpg");
  });

  it("uses the frontmatter feature image as the article image fallback", async () => {
    const article = await copyBlogArticleImages({
      ...baseArticle,
      imageUrl: undefined,
    });

    expect(article.imageUrl).toBe(
      "https://clipstitchr.test/stored/https%3A%2F%2Fblogger.test%2Ffeature.png",
    );
  });
});
