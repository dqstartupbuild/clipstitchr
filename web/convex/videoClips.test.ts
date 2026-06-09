import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  get,
  list,
  listByLibraryKind,
  remove,
  save,
  updateCliprMusic,
  updateMetadata,
  updatePostedStatus,
  updatePoster,
} from "./videoClips";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  query: vi.fn((definition) => definition),
  videoClipCounts: {
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
  videoClipCounts: mocks.videoClipCounts,
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
    filter: vi.fn(() => chain),
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
        get: vi.fn(async (_id: string) => ({ _id, id: "clip_1" })),
        insert: vi.fn(async () => "doc_inserted"),
        patch: vi.fn(),
        query: vi.fn(() => chain),
      },
    },
  };
}

function createSaveArgs(overrides: Record<string, unknown> = {}) {
  return {
    aspectRatio: 9 / 16,
    clipType: "ugc",
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 8,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    mimeType: "video/mp4",
    name: "Clip",
    originalName: "clip.mp4",
    originalSize: 100,
    size: 100,
    sourceMimeType: "video/mp4",
    tags: ["ugc"],
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: "clip.mp4",
      size: 100,
    },
    width: 1080,
    ...overrides,
  };
}

describe("convex videoClips", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("lists and gets clips for the authenticated owner", async () => {
    const clips = [{ _id: "doc_1", id: "clip_1" }];
    const { chain, ctx } = createCtx([{ _id: "doc_1", id: "clip_1" }], clips);

    await expect(
      getHandler(list)(ctx, {
        paginationOpts: { cursor: null, numItems: 20 },
        sortOrder: "oldest",
      }),
    ).resolves.toBe(clips);
    await expect(getHandler(get)(ctx, { id: "clip_1" })).resolves.toEqual({
      _id: "doc_1",
      id: "clip_1",
    });
    expect(ctx.db.query).toHaveBeenCalledWith("videoClips");
    expect(chain.order).toHaveBeenCalledWith("asc");
    expect(chain.paginate).toHaveBeenCalledWith({
      cursor: null,
      numItems: 20,
    });
  });

  it("lists clips by library kind", async () => {
    const clips = [{ _id: "doc_1", id: "clip_1" }];
    const { chain, ctx } = createCtx([], clips);

    await expect(
      getHandler(listByLibraryKind)(ctx, {
        kind: "demo",
        paginationOpts: { cursor: null, numItems: 20 },
      }),
    ).resolves.toBe(clips);

    expect(chain.withIndex).toHaveBeenCalledWith(
      "by_owner_library_kind_created",
      expect.any(Function),
    );
    expect(chain.filter).not.toHaveBeenCalled();
    expect(chain.order).toHaveBeenCalledWith("desc");
    expect(chain.paginate).toHaveBeenCalledWith({
      cursor: null,
      numItems: 20,
    });
  });

  it("requires valid products for demo saves and inserts or patches clips", async () => {
    let setup = createCtx([null]);

    await expect(
      getHandler(save)(
        setup.ctx,
        createSaveArgs({
          clipType: "demo",
          productId: "missing_product",
          tags: ["demo"],
        }),
      ),
    ).rejects.toThrow("Product not found.");

    setup = createCtx([{ id: "product_1" }, null]);
    await expect(
      getHandler(save)(
        setup.ctx,
        createSaveArgs({
          clipType: "demo",
          productId: " product_1 ",
          tags: ["demo"],
        }),
      ),
    ).resolves.toBe("doc_inserted");
    expect(setup.ctx.db.insert).toHaveBeenCalledWith(
      "videoClips",
      expect.objectContaining({
        libraryKind: "demo",
        ownerId: "owner_123",
        productId: "product_1",
      }),
    );

    setup = createCtx([{ _id: "doc_existing", id: "clip_1" }]);
    await expect(getHandler(save)(setup.ctx, createSaveArgs())).resolves.toBe(
      "doc_existing",
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_existing",
      expect.objectContaining({
        libraryKind: "ugc",
        ownerId: "owner_123",
      }),
    );
  });

  it("updates metadata with demo product validation", async () => {
    let setup = createCtx([{ _id: "doc_1", clipType: "ugc", id: "clip_1" }]);

    await expect(
      getHandler(updateMetadata)(setup.ctx, {
        id: "clip_1",
        productId: "product_1",
        updatedAt: "2026-05-20T00:00:00.000Z",
      }),
    ).rejects.toThrow("Only demo videos can be linked to products.");

    setup = createCtx([
      { _id: "doc_1", clipType: "demo", id: "clip_1" },
      { id: "product_1" },
    ]);
    await getHandler(updateMetadata)(setup.ctx, {
      defaultTrimRange: { start: 1, end: 4 },
      id: "clip_1",
      name: "Updated",
      productId: " product_1 ",
      tags: ["demo"],
      updatedAt: "2026-05-20T00:00:00.000Z",
      videoDescription: "Demo",
    });

    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({
        defaultTrimRange: { start: 1, end: 4 },
        name: "Updated",
        productId: "product_1",
        tags: ["demo"],
        videoDescription: "Demo",
      }),
    );
  });

  it("updates poster and Clipr music, then removes clips", async () => {
    const setup = createCtx([
      { _id: "doc_1", id: "clip_1" },
      {
        _id: "doc_1",
        cliprMetadata: {
          providerModels: ["old-model"],
        },
        id: "clip_1",
      },
      { _id: "doc_1", id: "clip_1" },
      null,
    ]);

    await getHandler(updatePoster)(setup.ctx, {
      id: "clip_1",
      posterObject: { contentType: "image/jpeg", key: "poster.jpg", size: 10 },
      posterVersion: 2,
      updatedAt: "2026-05-20T00:00:00.000Z",
    });
    await getHandler(updateCliprMusic)(setup.ctx, {
      id: "clip_1",
      music: {
        audioObject: {
          contentType: "audio/mpeg",
          key: "music.mp3",
          size: 100,
        },
        enabled: true,
        id: "music_1",
        providerModel: "new-model",
        source: "generated",
        title: "Music",
        volume: 1,
      },
      updatedAt: "2026-05-20T00:00:00.000Z",
    });
    await expect(getHandler(remove)(setup.ctx, { id: "clip_1" })).resolves.toEqual(
      { _id: "doc_1", id: "clip_1" },
    );
    await expect(getHandler(remove)(setup.ctx, { id: "missing" })).resolves.toBeNull();

    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({
        posterVersion: 2,
      }),
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({
        cliprMetadata: expect.objectContaining({
          providerModels: ["old-model", "new-model"],
        }),
        libraryKind: "clipr",
      }),
    );
    expect(setup.ctx.db.delete).toHaveBeenCalledWith("doc_1");
  });

  it("updates posted status using Stitch active semantics", async () => {
    const setup = createCtx([
      { _id: "doc_1", id: "clip_1" },
      { _id: "doc_1", id: "clip_1" },
    ]);

    await getHandler(updatePostedStatus)(setup.ctx, {
      id: "clip_1",
      isPosted: true,
    });
    await getHandler(updatePostedStatus)(setup.ctx, {
      id: "clip_1",
      isPosted: false,
    });

    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({
        isPosted: true,
        postedAt: expect.any(String),
      }),
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith("doc_1", {
      isPosted: undefined,
      postedAt: undefined,
    });
    expect(mocks.videoClipCounts.replaceOrInsert).toHaveBeenCalledTimes(2);
  });
});
