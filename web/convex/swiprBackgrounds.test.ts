import { beforeEach, describe, expect, it, vi } from "vitest";
import { get, list, save } from "./swiprBackgrounds";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  query: vi.fn((definition) => definition),
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

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(options: {
  collect?: unknown[];
  unique?: unknown;
} = {}) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    collect: vi.fn(async () => options.collect ?? []),
    order: vi.fn(() => chain),
    unique: vi.fn(async () => options.unique ?? null),
    withIndex: vi.fn(
      (_indexName: string, callback?: (q: typeof indexQuery) => void) => {
        callback?.(indexQuery);

        return chain;
      },
    ),
  };

  return chain;
}

function createBackground(overrides: Record<string, unknown> = {}) {
  return {
    _id: "doc_1",
    id: "background_1",
    name: "Studio",
    uploadedByOwnerId: "owner_123",
    ...overrides,
  };
}

function createSaveArgs(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    description: "  Clean studio  ",
    details: "  Product pedestal  ",
    height: 1920,
    id: "background_1",
    imageObject: {
      contentType: "image/jpeg",
      key: "user_123/swipr-backgrounds/background_1.jpg",
      size: 10,
    },
    mimeType: "image/jpeg",
    name: "  Studio  ",
    size: 10,
    source: "upload",
    tags: ["studio"],
    width: 1080,
    ...overrides,
  };
}

describe("convex swiprBackgrounds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("lists and gets Swipr backgrounds for authenticated users", async () => {
    const backgrounds = [createBackground()];
    const queryChain = createQueryChain({
      collect: backgrounds,
      unique: createBackground(),
    });
    const ctx = {
      db: {
        query: vi.fn(() => queryChain),
      },
    };

    await expect(getHandler(list)(ctx, {})).resolves.toStrictEqual(backgrounds);
    await expect(getHandler(get)(ctx, { id: "background_1" })).resolves.toEqual(
      createBackground(),
    );
    expect(queryChain.withIndex).toHaveBeenCalledWith("by_created");
    expect(queryChain.withIndex).toHaveBeenCalledWith(
      "by_background_id",
      expect.any(Function),
    );
  });

  it("normalizes and saves a new background", async () => {
    const ctx = {
      db: {
        insert: vi.fn(async () => "doc_1"),
        query: vi.fn(() => createQueryChain()),
      },
    };

    await expect(getHandler(save)(ctx, createSaveArgs())).resolves.toBe("doc_1");
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexRecordSave",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "swiprBackgrounds",
      expect.objectContaining({
        description: "Clean studio",
        details: "Product pedestal",
        name: "Studio",
        uploadedByOwnerId: "owner_123",
      }),
    );
  });

  it("rejects blank names and duplicate backgrounds before consuming quota", async () => {
    const ctx = {
      db: {
        insert: vi.fn(),
        query: vi.fn(() => createQueryChain()),
      },
    };

    await expect(
      getHandler(save)(ctx, createSaveArgs({ name: " " })),
    ).rejects.toThrow("Background name is required.");
    expect(mocks.rateLimiter.limit).not.toHaveBeenCalled();

    ctx.db.query.mockReturnValueOnce(
      createQueryChain({ unique: createBackground() }),
    );
    await expect(getHandler(save)(ctx, createSaveArgs())).rejects.toThrow(
      "Background already exists.",
    );
  });
});
