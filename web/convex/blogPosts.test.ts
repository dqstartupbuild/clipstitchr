import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  listPublishedBlogPostCards,
  upsertPublishedArticle,
} from "./blogPosts";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

type QueryResult = {
  collect?: unknown[];
  unique?: unknown;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
  query: vi.fn((definition) => definition),
}));

vi.mock("./_generated/server", () => ({
  mutation: mocks.mutation,
  query: mocks.query,
}));

vi.mock("./auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(result: QueryResult = {}) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    collect: vi.fn(async () => result.collect ?? []),
    order: vi.fn(() => chain),
    take: vi.fn(async () => result.collect ?? []),
    unique: vi.fn(async () => result.unique ?? null),
    withIndex: vi.fn(
      (_index: string, callback?: (q: typeof indexQuery) => void) => {
        callback?.(indexQuery);

        return chain;
      },
    ),
  };

  return chain;
}

describe("blogPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes compact blog card rows when publishing articles", async () => {
    const blogPostQueryChain = createQueryChain({ unique: null });
    const blogPostCardQueryChain = createQueryChain({ unique: null });
    const ctx = {
      db: {
        insert: vi.fn(async () => "doc_1"),
        query: vi.fn((tableName: string) =>
          tableName === "blogPostCards"
            ? blogPostCardQueryChain
            : blogPostQueryChain,
        ),
      },
    };

    await expect(
      getHandler(upsertPublishedArticle)(ctx, {
        secret: "secret",
        slug: "runtime-blog",
        title: "Runtime Blog",
        metaDescription: "A short summary.",
        contentFormat: "markdown",
        content: "# Runtime Blog\n\nBody",
        tags: ["keyword"],
        source: "Blogger",
      }),
    ).resolves.toEqual({ slug: "runtime-blog", status: "created" });

    expect(mocks.assertRateLimitApiSecret).toHaveBeenCalledWith("secret");
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "blogPosts",
      expect.objectContaining({
        content: "# Runtime Blog\n\nBody",
        slug: "runtime-blog",
      }),
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "blogPostCards",
      expect.objectContaining({
        slug: "runtime-blog",
        title: "Runtime Blog",
        metaDescription: "A short summary.",
        readingTimeMinutes: 1,
      }),
    );
    expect(ctx.db.insert).not.toHaveBeenCalledWith(
      "blogPostCards",
      expect.objectContaining({
        content: expect.any(String),
      }),
    );
  });

  it("lists published blog cards without article bodies", async () => {
    const blogPostCardQueryChain = createQueryChain({
      collect: [
        {
          slug: "runtime-blog",
          title: "Runtime Blog",
          metaDescription: "A short summary.",
          imageUrl: undefined,
          tags: ["keyword"],
          source: "Blogger",
          readingTimeMinutes: 1,
          publishedAt: "2026-06-23T16:00:00.000Z",
          createdAt: "2026-06-23T15:30:00.000Z",
          updatedAt: "2026-06-23T15:45:00.000Z",
        },
      ],
    });
    const ctx = {
      db: {
        query: vi.fn(() => blogPostCardQueryChain),
      },
    };

    await expect(getHandler(listPublishedBlogPostCards)(ctx, {})).resolves.toEqual([
      {
        slug: "runtime-blog",
        title: "Runtime Blog",
        metaDescription: "A short summary.",
        imageUrl: undefined,
        tags: ["keyword"],
        source: "Blogger",
        readingTimeMinutes: 1,
        publishedAt: "2026-06-23T16:00:00.000Z",
        createdAt: "2026-06-23T15:30:00.000Z",
        updatedAt: "2026-06-23T15:45:00.000Z",
      },
    ]);
    expect(ctx.db.query).toHaveBeenCalledWith("blogPostCards");
  });
});
