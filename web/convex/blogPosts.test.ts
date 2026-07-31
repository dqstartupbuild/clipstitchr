import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  listPublishedBlogPostCards,
  upsertPublishedArticle,
} from "./blogPosts";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

type StoredDocument = {
  _id: string;
  _creationTime: number;
  [key: string]: unknown;
};

type BlogTestState = {
  blogPosts: StoredDocument[];
  blogPostCards: StoredDocument[];
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

function createBlogTestContext(initialState?: Partial<BlogTestState>) {
  const state: BlogTestState = {
    blogPosts: [...(initialState?.blogPosts ?? [])],
    blogPostCards: [...(initialState?.blogPostCards ?? [])],
  };
  let nextId = 1;

  function createQueryChain(documents: StoredDocument[]) {
    const chain = {
      collect: vi.fn(async () =>
        documents.map((document) => ({ ...document })),
      ),
      order: vi.fn(() => chain),
      take: vi.fn(async (limit: number) =>
        documents.slice(0, limit).map((document) => ({ ...document })),
      ),
      unique: vi.fn(async () =>
        documents[0] ? { ...documents[0] } : null,
      ),
    };

    return chain;
  }

  const db = {
    delete: vi.fn(async (id: string) => {
      for (const table of Object.values(state)) {
        const index = table.findIndex((document) => document._id === id);

        if (index >= 0) {
          table.splice(index, 1);
          return;
        }
      }
    }),
    insert: vi.fn(
      async (tableName: keyof BlogTestState, fields: Record<string, unknown>) => {
        const id = `${tableName}_${nextId++}`;

        state[tableName].push({
          _id: id,
          _creationTime: Date.now(),
          ...fields,
        });

        return id;
      },
    ),
    patch: vi.fn(async (id: string, fields: Record<string, unknown>) => {
      for (const table of Object.values(state)) {
        const document = table.find((candidate) => candidate._id === id);

        if (document) {
          Object.assign(document, fields);
          return;
        }
      }
    }),
    query: vi.fn((tableName: keyof BlogTestState) => ({
      withIndex: (
        _indexName: string,
        applyIndex?: (query: {
          eq: (field: string, value: unknown) => unknown;
        }) => void,
      ) => {
        let field: string | undefined;
        let value: unknown;
        const indexQuery = {
          eq: (nextField: string, nextValue: unknown) => {
            field = nextField;
            value = nextValue;
            return indexQuery;
          },
        };

        applyIndex?.(indexQuery);

        const indexField = field;
        const documents =
          indexField === undefined
            ? [...state[tableName]]
            : state[tableName].filter(
                (document) => document[indexField] === value,
              );

        return createQueryChain(documents);
      },
    })),
  };

  return { ctx: { db }, db, state };
}

function createPublishArgs(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    secret: "secret",
    slug: "runtime-blog",
    externalId: "blog-id",
    title: "Runtime Blog",
    seoTitle: "Runtime Blog SEO Title With Clear Search Intent and Next Steps",
    metaDescription: "A short summary.",
    contentFormat: "markdown",
    content: "# Runtime Blog\n\nBody",
    tags: ["keyword"],
    source: "Blogr",
    createdAt: "2026-06-23T15:30:00.000Z",
    updatedAt: "2026-06-23T15:45:00.000Z",
    ...overrides,
  };
}

describe("blogPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes compact blog card rows when publishing articles", async () => {
    const { ctx, state } = createBlogTestContext();

    await expect(
      getHandler(upsertPublishedArticle)(ctx, createPublishArgs()),
    ).resolves.toEqual({
      slug: "runtime-blog",
      replacedSlugs: [],
      status: "created",
    });

    expect(mocks.assertRateLimitApiSecret).toHaveBeenCalledWith("secret");
    expect(state.blogPosts).toHaveLength(1);
    expect(state.blogPosts[0]).toMatchObject({
      content: "# Runtime Blog\n\nBody",
      slug: "runtime-blog",
      seoTitle: "Runtime Blog SEO Title With Clear Search Intent and Next Steps",
    });
    expect(state.blogPostCards).toHaveLength(1);
    expect(state.blogPostCards[0]).toMatchObject({
      slug: "runtime-blog",
      title: "Runtime Blog",
      seoTitle: "Runtime Blog SEO Title With Clear Search Intent and Next Steps",
      metaDescription: "A short summary.",
      readingTimeMinutes: 1,
    });
    expect(state.blogPostCards[0]).not.toHaveProperty("content");
  });

  it("matches by stable Blogr id before slug and removes stale records", async () => {
    const originalCreatedAt = "2026-01-10T09:00:00.000Z";
    const { ctx, state } = createBlogTestContext({
      blogPosts: [
        {
          _id: "post_original",
          _creationTime: 1,
          slug: "old-slug",
          externalId: "blog-id",
          title: "Old title",
          seoTitle: "Old SEO title",
          metaDescription: "Old description.",
          contentFormat: "markdown",
          content: "Old body",
          tags: [],
          source: "Blogr",
          publishedAt: "2026-01-11T09:00:00.000Z",
          createdAt: originalCreatedAt,
          updatedAt: "2026-01-12T09:00:00.000Z",
        },
        {
          _id: "post_slug_duplicate",
          _creationTime: 2,
          slug: "new-slug",
          externalId: "different-id",
          title: "Duplicate",
          metaDescription: "Duplicate.",
          contentFormat: "markdown",
          content: "Duplicate body",
          tags: [],
          publishedAt: "2026-01-13T09:00:00.000Z",
          createdAt: "2026-01-13T09:00:00.000Z",
          updatedAt: "2026-01-13T09:00:00.000Z",
        },
      ],
      blogPostCards: [
        {
          _id: "card_old",
          _creationTime: 1,
          slug: "old-slug",
        },
        {
          _id: "card_duplicate",
          _creationTime: 2,
          slug: "new-slug",
        },
      ],
    });

    await expect(
      getHandler(upsertPublishedArticle)(
        ctx,
        createPublishArgs({
          slug: "new-slug",
          title: "Updated visible title",
          seoTitle:
            "Updated SEO Title With Better Search Intent and Clear Next Steps",
          content: "# Updated body",
          createdAt: "2026-07-01T10:00:00.000Z",
          updatedAt: "2026-07-29T18:00:00.000Z",
        }),
      ),
    ).resolves.toEqual({
      slug: "new-slug",
      replacedSlugs: ["old-slug"],
      status: "updated",
    });

    expect(state.blogPosts).toHaveLength(1);
    expect(state.blogPosts[0]).toMatchObject({
      _id: "post_original",
      slug: "new-slug",
      title: "Updated visible title",
      seoTitle:
        "Updated SEO Title With Better Search Intent and Clear Next Steps",
      content: "# Updated body",
      createdAt: originalCreatedAt,
      updatedAt: "2026-07-29T18:00:00.000Z",
    });
    expect(state.blogPostCards).toHaveLength(1);
    expect(state.blogPostCards[0]).toMatchObject({
      slug: "new-slug",
      title: "Updated visible title",
      seoTitle:
        "Updated SEO Title With Better Search Intent and Clear Next Steps",
    });
  });

  it("falls back to slug for a legacy article without a Blogr id", async () => {
    const { ctx, state } = createBlogTestContext({
      blogPosts: [
        {
          _id: "legacy_post",
          _creationTime: 1,
          slug: "runtime-blog",
          title: "Legacy title",
          metaDescription: "Legacy description.",
          contentFormat: "markdown",
          content: "Legacy body",
          tags: [],
          publishedAt: "2026-01-11T09:00:00.000Z",
          createdAt: "2026-01-10T09:00:00.000Z",
          updatedAt: "2026-01-12T09:00:00.000Z",
        },
      ],
    });

    await getHandler(upsertPublishedArticle)(ctx, createPublishArgs());

    expect(state.blogPosts).toHaveLength(1);
    expect(state.blogPosts[0]).toMatchObject({
      _id: "legacy_post",
      externalId: "blog-id",
      slug: "runtime-blog",
      title: "Runtime Blog",
    });
  });

  it("keeps exactly one article and card after republishing", async () => {
    const { ctx, state } = createBlogTestContext();
    const handler = getHandler(upsertPublishedArticle);

    await handler(ctx, createPublishArgs());
    await handler(
      ctx,
      createPublishArgs({
        slug: "renamed-runtime-blog",
        content: "# Updated after republish",
        updatedAt: "2026-07-29T18:00:00.000Z",
      }),
    );

    expect(state.blogPosts).toHaveLength(1);
    expect(state.blogPostCards).toHaveLength(1);
    expect(state.blogPosts[0]).toMatchObject({
      slug: "renamed-runtime-blog",
      content: "# Updated after republish",
    });
    expect(state.blogPostCards[0]).toMatchObject({
      slug: "renamed-runtime-blog",
    });
  });

  it("lists published blog cards without article bodies", async () => {
    const { ctx } = createBlogTestContext({
      blogPostCards: [
        {
          _id: "card_1",
          _creationTime: 1,
          slug: "runtime-blog",
          title: "Runtime Blog",
          seoTitle:
            "Runtime Blog SEO Title With Clear Search Intent and Next Steps",
          metaDescription: "A short summary.",
          imageUrl: undefined,
          tags: ["keyword"],
          source: "Blogr",
          readingTimeMinutes: 1,
          publishedAt: "2026-06-23T16:00:00.000Z",
          createdAt: "2026-06-23T15:30:00.000Z",
          updatedAt: "2026-06-23T15:45:00.000Z",
        },
      ],
    });

    await expect(getHandler(listPublishedBlogPostCards)(ctx, {})).resolves.toEqual([
      {
        slug: "runtime-blog",
        title: "Runtime Blog",
        seoTitle:
          "Runtime Blog SEO Title With Clear Search Intent and Next Steps",
        metaDescription: "A short summary.",
        imageUrl: undefined,
        tags: ["keyword"],
        source: "Blogr",
        readingTimeMinutes: 1,
        publishedAt: "2026-06-23T16:00:00.000Z",
        createdAt: "2026-06-23T15:30:00.000Z",
        updatedAt: "2026-06-23T15:45:00.000Z",
      },
    ]);
  });
});
