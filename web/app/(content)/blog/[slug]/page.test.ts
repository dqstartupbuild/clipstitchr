import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getBlogPostCards: vi.fn(),
}));

vi.mock("@/lib/content/runtimeBlog/getBlogPostCards", () => ({
  getBlogPostCards: mocks.getBlogPostCards,
}));

import { generateStaticParams } from "./page";

describe("blog article static params", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes slugs from the compact webhook read model", async () => {
    mocks.getBlogPostCards.mockResolvedValue([
      {
        slug: "runtime-blog",
        url: "/blog/runtime-blog",
        title: "Runtime Blog",
        description: "A short summary.",
        category: "Blogr",
        tags: ["keyword"],
        date: "2026-06-23",
        updated: "2026-07-29",
        readingTimeMinutes: 1,
        featured: false,
      },
    ]);

    await expect(generateStaticParams()).resolves.toEqual([
      { slug: "runtime-blog" },
    ]);
  });
});
