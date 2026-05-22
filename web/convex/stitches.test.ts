import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  get,
  list,
  remove,
  save,
  updateMusic,
  updatePoster,
  updateRenderedVideo,
  updateTextOverlay,
} from "./stitches";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  query: vi.fn((definition) => definition),
  stitchCounts: {
    deleteIfExists: vi.fn(),
    insertIfDoesNotExist: vi.fn(),
    replaceOrInsert: vi.fn(),
  },
  rateLimiter: {
    limit: vi.fn(),
  },
}));

vi.mock("./_generated/server", () => ({
  mutation: mocks.mutation,
  query: mocks.query,
}));

vi.mock("./auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));

vi.mock("./rateLimiter", () => ({
  rateLimiter: mocks.rateLimiter,
}));

vi.mock("./aggregateCounts", () => ({
  stitchCounts: mocks.stitchCounts,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(uniqueValues: unknown[] = [], collect: unknown[] = []) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    collect: vi.fn(async () => collect),
    order: vi.fn(() => chain),
    paginate: vi.fn(async () => collect),
    unique: vi.fn(async () => uniqueValues.shift() ?? null),
    withIndex: vi.fn((_indexName: string, callback: (q: typeof indexQuery) => void) => {
      callback(indexQuery);

      return chain;
    }),
  };

  return chain;
}

function createCtx(uniqueValues: unknown[] = [], collect: unknown[] = []) {
  const chain = createQueryChain(uniqueValues, collect);

  return {
    chain,
    ctx: {
      db: {
        delete: vi.fn(),
        get: vi.fn(async (_id: string) => ({ _id, id: "stitch_1" })),
        insert: vi.fn(async () => "doc_inserted"),
        patch: vi.fn(),
        query: vi.fn(() => chain),
      },
    },
  };
}

function createSaveArgs(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    demoClipId: "demo_1",
    demoClipName: "Demo",
    duration: 12,
    height: 1920,
    id: "stitch_1",
    name: "Stitch",
    ugcClipId: "ugc_1",
    ugcClipName: "UGC",
    width: 1080,
    ...overrides,
  };
}

describe("convex stitches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("lists, gets, inserts, and patches stitches", async () => {
    const stitches = [{ _id: "doc_1", id: "stitch_1" }];
    let setup = createCtx([{ _id: "doc_1", id: "stitch_1" }], stitches);

    await expect(
      getHandler(list)(setup.ctx, {
        paginationOpts: { cursor: null, numItems: 20 },
      }),
    ).resolves.toBe(stitches);
    await expect(getHandler(get)(setup.ctx, { id: "stitch_1" })).resolves.toEqual(
      { _id: "doc_1", id: "stitch_1" },
    );
    expect(setup.chain.order).toHaveBeenCalledWith("desc");
    expect(setup.chain.paginate).toHaveBeenCalledWith({
      cursor: null,
      numItems: 20,
    });

    setup = createCtx([null]);
    await expect(getHandler(save)(setup.ctx, createSaveArgs())).resolves.toBe(
      "doc_inserted",
    );
    expect(setup.ctx.db.insert).toHaveBeenCalledWith(
      "stitches",
      expect.objectContaining({
        ownerId: "owner_123",
      }),
    );

    setup = createCtx([{ _id: "doc_existing", id: "stitch_1" }]);
    await expect(getHandler(save)(setup.ctx, createSaveArgs())).resolves.toBe(
      "doc_existing",
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_existing",
      expect.objectContaining({
        ownerId: "owner_123",
      }),
    );
  });

  it("updates poster, rendered video, music, and text overlay", async () => {
    const setup = createCtx([
      { _id: "doc_1", id: "stitch_1" },
      { _id: "doc_1", id: "stitch_1" },
      { _id: "doc_1", id: "stitch_1" },
      { _id: "doc_1", id: "stitch_1" },
    ]);

    await getHandler(updatePoster)(setup.ctx, {
      id: "stitch_1",
      posterObject: { contentType: "image/jpeg", key: "poster.jpg", size: 10 },
      posterVersion: 2,
    });
    await getHandler(updateRenderedVideo)(setup.ctx, {
      id: "stitch_1",
      mimeType: "video/mp4",
      size: 100,
      stitchObject: { contentType: "video/mp4", key: "stitch.mp4", size: 100 },
    });
    await getHandler(updateMusic)(setup.ctx, {
      id: "stitch_1",
      music: null,
    });
    await getHandler(updateTextOverlay)(setup.ctx, {
      id: "stitch_1",
      textOverlay: null,
    });

    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({ posterVersion: 2 }),
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({ mimeType: "video/mp4" }),
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith("doc_1", {
      music: undefined,
    });
    expect(setup.ctx.db.patch).toHaveBeenCalledWith("doc_1", {
      textOverlay: undefined,
    });
  });

  it("throws for missing updates and returns removed stitches", async () => {
    let setup = createCtx([null]);

    await expect(
      getHandler(updatePoster)(setup.ctx, {
        id: "missing",
        posterObject: { contentType: "image/jpeg", key: "poster.jpg", size: 10 },
        posterVersion: 2,
      }),
    ).rejects.toThrow("Stitch not found.");

    setup = createCtx([{ _id: "doc_1", id: "stitch_1" }, null]);
    await expect(getHandler(remove)(setup.ctx, { id: "stitch_1" })).resolves.toEqual(
      { _id: "doc_1", id: "stitch_1" },
    );
    await expect(getHandler(remove)(setup.ctx, { id: "missing" })).resolves.toBeNull();
    expect(setup.ctx.db.delete).toHaveBeenCalledWith("doc_1");
  });
});
