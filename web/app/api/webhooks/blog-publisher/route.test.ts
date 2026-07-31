import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
  };

  return {
    convex,
    createConvexHttpClient: vi.fn(() => convex),
    copyBlogArticleImages: vi.fn(),
    getIsAuthorizedBlogPublishRequest: vi.fn(),
    revalidatePath: vi.fn(),
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    blogPosts: {
      upsertPublishedArticle: "blogPosts.upsertPublishedArticle",
    },
    rateLimits: {
      consumeBlogPublishWebhook: "rateLimits.consumeBlogPublishWebhook",
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: mocks.createConvexHttpClient,
}));

vi.mock("@/lib/clipstitchr/server/blog/copyBlogArticleImages", () => ({
  copyBlogArticleImages: mocks.copyBlogArticleImages,
}));

vi.mock(
  "@/lib/clipstitchr/server/blog/getIsAuthorizedBlogPublishRequest",
  () => ({
    getIsAuthorizedBlogPublishRequest: mocks.getIsAuthorizedBlogPublishRequest,
  }),
);

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

import { POST } from "@/app/api/webhooks/blog-publisher/route";

const baseArticle = {
  id: "blog-id",
  title: "A Helpful Blog Title",
  seo_title:
    "A Helpful Blog Title for Search Results With Clear Next Steps",
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

function createRequest(body: unknown) {
  return new Request("https://example.com/api/webhooks/blog-publisher", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/webhooks/blog-publisher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.convex.mutation.mockImplementation(async (name) =>
      name === "blogPosts.upsertPublishedArticle"
        ? { replacedSlugs: [], slug: baseArticle.slug, status: "created" }
        : undefined,
    );
    mocks.copyBlogArticleImages.mockImplementation(async (article) => article);
  });

  it("returns 401 with the invalid token error when unauthorized", async () => {
    mocks.getIsAuthorizedBlogPublishRequest.mockReturnValue(false);

    const response = await POST(
      createRequest({
        event_type: "publish_articles",
        data: { articles: [baseArticle] },
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid access token.",
    });
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.copyBlogArticleImages).not.toHaveBeenCalled();
  });

  it("copies article images, publishes every article, and returns 200", async () => {
    mocks.getIsAuthorizedBlogPublishRequest.mockReturnValue(true);
    mocks.copyBlogArticleImages.mockImplementation(async (article) => ({
      ...article,
      content:
        article.slug === "a-helpful-blog-title"
          ? "![Hero](https://clipstitchr.test/blog-images/a-helpful-blog-title/hero.jpg)"
          : article.content,
      imageUrl:
        article.slug === "a-helpful-blog-title"
          ? "https://clipstitchr.test/blog-images/a-helpful-blog-title/hero.jpg"
          : article.imageUrl,
    }));

    const response = await POST(
      createRequest({
        event_type: "publish_articles",
        data: { articles: [baseArticle, { ...baseArticle, slug: "second" }] },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ message: "Published." });

    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      "rateLimits.consumeBlogPublishWebhook",
      expect.objectContaining({ articleCount: 2, secret: "rate-limit-secret" }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      "blogPosts.upsertPublishedArticle",
      expect.objectContaining({
        slug: "a-helpful-blog-title",
        externalId: "blog-id",
        seoTitle:
          "A Helpful Blog Title for Search Results With Clear Next Steps",
        contentFormat: "mdx",
        content:
          "![Hero](https://clipstitchr.test/blog-images/a-helpful-blog-title/hero.jpg)",
        imageUrl:
          "https://clipstitchr.test/blog-images/a-helpful-blog-title/hero.jpg",
      }),
    );
    expect(
      mocks.convex.mutation.mock.invocationCallOrder[0],
    ).toBeLessThan(mocks.copyBlogArticleImages.mock.invocationCallOrder[0]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/blog");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/feed.xml");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/blog/a-helpful-blog-title",
    );
  });

  it("upserts a single article for update_article", async () => {
    mocks.getIsAuthorizedBlogPublishRequest.mockReturnValue(true);

    const response = await POST(
      createRequest({
        event_type: "update_article",
        data: { article: baseArticle },
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      "rateLimits.consumeBlogPublishWebhook",
      expect.objectContaining({ articleCount: 1 }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      "blogPosts.upsertPublishedArticle",
      expect.objectContaining({
        externalId: "blog-id",
        seoTitle:
          "A Helpful Blog Title for Search Results With Clear Next Steps",
      }),
    );
  });

  it("revalidates a replaced slug after an id-based update", async () => {
    mocks.getIsAuthorizedBlogPublishRequest.mockReturnValue(true);
    mocks.convex.mutation.mockImplementation(async (name) =>
      name === "blogPosts.upsertPublishedArticle"
        ? {
            replacedSlugs: ["the-original-slug"],
            slug: baseArticle.slug,
            status: "updated",
          }
        : undefined,
    );

    const response = await POST(
      createRequest({
        event_type: "update_article",
        data: { article: baseArticle },
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/blog/the-original-slug",
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/blog/a-helpful-blog-title",
    );
  });

  it("returns 400 for an invalid payload", async () => {
    mocks.getIsAuthorizedBlogPublishRequest.mockReturnValue(true);

    const response = await POST(
      createRequest({ event_type: "publish_articles", data: { articles: [] } }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid blog publish payload.",
    });
  });

  it("returns 400 for invalid json", async () => {
    mocks.getIsAuthorizedBlogPublishRequest.mockReturnValue(true);

    const request = new Request(
      "https://example.com/api/webhooks/blog-publisher",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Request body must be valid JSON.",
    });
  });
});
