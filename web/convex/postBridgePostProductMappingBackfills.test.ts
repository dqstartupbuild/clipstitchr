import { beforeEach, describe, expect, it, vi } from "vitest";
import { backfillLegacyPostBridgePostProductMappings } from "./postBridgePostProductMappingBackfills";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
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

vi.mock("./auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: vi.fn(),
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createPostBridgePost(postId: string) {
  return {
    createdAt: "2026-07-01T00:00:00.000Z",
    hasAudio: true,
    mediaIds: ["media_1"],
    mediaKind: "video",
    platforms: ["tiktok"],
    postId,
    socialAccountIds: [123],
    title: "Scheduled post",
  };
}

function createCtx(page: unknown[]) {
  const sourceChain = {
    paginate: vi.fn(async () => ({
      continueCursor: "next_cursor",
      isDone: false,
      page,
    })),
  };
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const mappingChain = {
    unique: vi.fn(async () => null),
    withIndex: vi.fn(
      (_indexName: string, callback: (q: typeof indexQuery) => unknown) => {
        callback(indexQuery);

        return mappingChain;
      },
    ),
  };
  const ctx = {
    db: {
      insert: vi.fn(async () => "mapping_doc_1"),
      patch: vi.fn(async () => undefined),
      query: vi.fn((tableName: string) =>
        tableName === "postBridgePostProductMappings"
          ? mappingChain
          : sourceChain,
      ),
    },
  };

  return {
    ctx,
    mappingChain,
    sourceChain,
  };
}

describe("backfillLegacyPostBridgePostProductMappings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("backfills legacy stitch post mappings by stitch product", async () => {
    const setup = createCtx([
      {
        id: "stitch_1",
        ownerId: "user_123",
        postBridgePosts: [
          createPostBridgePost("post_1"),
          createPostBridgePost("post_2"),
        ],
        productId: " product_1 ",
      },
      {
        id: "stitch_2",
        ownerId: "user_123",
        postBridgePosts: [createPostBridgePost("post_3")],
        productId: undefined,
      },
    ]);

    await expect(
      getHandler(backfillLegacyPostBridgePostProductMappings)(setup.ctx, {
        paginationOpts: { cursor: null, numItems: 100 },
        secret: "secret",
        sourceType: "stitch",
      }),
    ).resolves.toEqual({
      continueCursor: "next_cursor",
      isDone: false,
      mappedPosts: 2,
      processed: 2,
      skippedPosts: 1,
    });

    expect(mocks.assertRateLimitApiSecret).toHaveBeenCalledWith("secret");
    expect(setup.ctx.db.query).toHaveBeenCalledWith("stitches");
    expect(setup.ctx.db.insert).toHaveBeenCalledTimes(2);
    expect(setup.ctx.db.insert).toHaveBeenCalledWith(
      "postBridgePostProductMappings",
      expect.objectContaining({
        ownerId: "user_123",
        postId: "post_1",
        productId: "product_1",
        sourceId: "stitch_1",
        sourceType: "stitch",
      }),
    );
  });

  it("backfills legacy swipe post mappings by swipe product", async () => {
    const setup = createCtx([
      {
        id: "swipe_1",
        ownerId: "user_123",
        postBridgePosts: [createPostBridgePost("post_4")],
        productSourceId: "product_2",
      },
    ]);

    await expect(
      getHandler(backfillLegacyPostBridgePostProductMappings)(setup.ctx, {
        paginationOpts: { cursor: null, numItems: 100 },
        secret: "secret",
        sourceType: "swipe",
      }),
    ).resolves.toEqual({
      continueCursor: "next_cursor",
      isDone: false,
      mappedPosts: 1,
      processed: 1,
      skippedPosts: 0,
    });

    expect(setup.ctx.db.query).toHaveBeenCalledWith("swipes");
    expect(setup.ctx.db.insert).toHaveBeenCalledWith(
      "postBridgePostProductMappings",
      expect.objectContaining({
        ownerId: "user_123",
        postId: "post_4",
        productId: "product_2",
        sourceId: "swipe_1",
        sourceType: "swipe",
      }),
    );
  });
});
