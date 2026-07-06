import { beforeEach, describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";

const mocks = vi.hoisted(() => ({
  fetchConvexBlogPostCards: vi.fn(),
}));

vi.mock("@/lib/content/runtimeBlog/fetchConvexBlogPostCards", () => ({
  fetchConvexBlogPostCards: mocks.fetchConvexBlogPostCards,
}));

describe("sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchConvexBlogPostCards.mockResolvedValue([]);
  });

  it("covers public pages and excludes authenticated dashboard pages", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("http://localhost:3000/");
    expect(urls).toContain("http://localhost:3000/blog");
    expect(urls).toContain("http://localhost:3000/blog/what-is-ugc");
    expect(urls).not.toContain("http://localhost:3000/blog/guppy-30-day-growth");
    expect(urls).toContain("http://localhost:3000/case-studies");
    expect(urls).toContain(
      "http://localhost:3000/case-studies/fitness-app-growth-case-study-guppy",
    );
    expect(urls).toContain("http://localhost:3000/docs");
    expect(urls).toContain("http://localhost:3000/examples");
    expect(urls).toContain("http://localhost:3000/pricing");
    expect(urls).toContain(
      "http://localhost:3000/examples/stitchr-boyfriend-ten-out-of-ten",
    );
    expect(urls).toContain("http://localhost:3000/docs/getting-started");
    expect(urls).toContain("http://localhost:3000/docs/clipstitchr-cli");
    expect(urls).toContain("http://localhost:3000/docs/stitchr");
    expect(urls).toContain("http://localhost:3000/docs/clipr");
    expect(urls).toContain("http://localhost:3000/docs/swipr");
    expect(urls).toContain("http://localhost:3000/docs/swapr");
    expect(urls).toContain("http://localhost:3000/docs/avatars");
    expect(urls).toContain("http://localhost:3000/docs/rate-limits");
    expect(urls).not.toContain("http://localhost:3000/dashboard");
    expect(urls).not.toContain("http://localhost:3000/dashboard/avatars");
    expect(urls).not.toContain("http://localhost:3000/dashboard/stitchr");
    expect(urls).not.toContain("http://localhost:3000/dashboard/uploads");
    expect(urls).not.toContain("http://localhost:3000/dashboard/swapr");
    expect(urls).not.toContain("http://localhost:3000/dashboard/stitches");
  });

  it("includes webhook-published blog posts", async () => {
    mocks.fetchConvexBlogPostCards.mockResolvedValue([
      {
        slug: "runtime-blog",
        title: "Runtime Blog",
        metaDescription: "A short summary.",
        imageUrl: "http://localhost:3000/blog-images/runtime-blog/hero.jpg",
        tags: ["keyword"],
        source: "Blogger",
        readingTimeMinutes: 1,
        publishedAt: "2026-06-23T16:00:00.000Z",
        createdAt: "2026-06-23T15:30:00.000Z",
        updatedAt: "2026-06-23T15:45:00.000Z",
      },
    ]);

    const entries = await sitemap();
    const runtimeEntry = entries.find(
      (entry) => entry.url === "http://localhost:3000/blog/runtime-blog",
    );

    expect(runtimeEntry).toMatchObject({
      images: ["http://localhost:3000/blog-images/runtime-blog/hero.jpg"],
    });
  });
});
