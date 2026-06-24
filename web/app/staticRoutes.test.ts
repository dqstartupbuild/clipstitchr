import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getFeed } from "@/app/feed.xml/route";
import { GET as getLlmsTxt } from "@/app/llms.txt/route";
import { GET as getVideoSitemap } from "@/app/video-sitemap.xml/route";

const mocks = vi.hoisted(() => ({
  fetchConvexBlogPosts: vi.fn(),
}));

vi.mock("@/lib/content/runtimeBlog/fetchConvexBlogPosts", () => ({
  fetchConvexBlogPosts: mocks.fetchConvexBlogPosts,
}));

describe("static metadata routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchConvexBlogPosts.mockResolvedValue([]);
  });

  it("serves the RSS feed with XML cache headers", async () => {
    mocks.fetchConvexBlogPosts.mockResolvedValue([
      {
        slug: "runtime-blog",
        title: "Runtime Blog",
        metaDescription: "A short summary.",
        contentFormat: "markdown",
        content: "# Runtime Blog\n\nBody",
        contentHtml: undefined,
        imageUrl: undefined,
        tags: ["keyword"],
        source: "Blogger",
        publishedAt: "2026-06-23T16:00:00.000Z",
        createdAt: "2026-06-23T15:30:00.000Z",
        updatedAt: "2026-06-23T15:45:00.000Z",
      },
    ]);

    const response = await getFeed();
    const body = await response.text();

    expect(response.headers.get("content-type")).toBe(
      "application/rss+xml; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toContain("s-maxage=3600");
    expect(body).toContain("<rss");
    expect(body).toContain("ClipStitchr");
    expect(body).toContain("http://localhost:3000/blog/runtime-blog");
  });

  it("serves llms.txt with plain text cache headers", async () => {
    const response = getLlmsTxt();
    const body = await response.text();

    expect(response.headers.get("content-type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toContain("s-maxage=3600");
    expect(body).toContain("# ClipStitchr");
  });

  it("serves the video sitemap with example output metadata", async () => {
    const response = getVideoSitemap();
    const body = await response.text();

    expect(response.headers.get("content-type")).toBe(
      "application/xml; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toContain("s-maxage=3600");
    expect(body).toContain("<video:video>");
    expect(body).toContain(
      "http://localhost:3000/examples/stitchr-boyfriend-ten-out-of-ten",
    );
    expect(body).toContain(
      "http://localhost:3000/example-outputs/clipstitchr-example-11.webm",
    );
  });
});
