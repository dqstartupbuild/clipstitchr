import { beforeEach, describe, expect, it, vi } from "vitest";
import { update } from "./avatars";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertProductBelongsToOwner: vi.fn(),
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

vi.mock("./assertProductBelongsToOwner", () => ({
  assertProductBelongsToOwner: mocks.assertProductBelongsToOwner,
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

function createQueryChain(uniqueValues: unknown[] = [], collect: unknown[] = []) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const filterQuery = {
    eq: vi.fn(() => true),
    field: vi.fn((fieldName: string) => fieldName),
  };
  const chain = {
    collect: vi.fn(async () => collect),
    filter: vi.fn((callback: (q: typeof filterQuery) => unknown) => {
      callback(filterQuery);

      return chain;
    }),
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
        patch: vi.fn(),
        query: vi.fn(() => chain),
      },
    },
  };
}

describe("convex avatars", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertProductBelongsToOwner.mockResolvedValue(undefined);
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("updates an avatar product and moves its photos", async () => {
    const setup = createCtx(
      [
        {
          _id: "avatar_doc_1",
          id: "avatar_1",
          name: "Nova",
          productId: "product_1",
        },
      ],
      [
        { _id: "photo_doc_1", avatarId: "avatar_1", id: "photo_1" },
        { _id: "photo_doc_2", avatarId: "avatar_1", id: "photo_2" },
      ],
    );

    await getHandler(update)(setup.ctx, {
      id: "avatar_1",
      name: "Nova",
      productId: " product_2 ",
      updatedAt: "2026-05-20T00:00:00.000Z",
    });

    expect(mocks.assertProductBelongsToOwner).toHaveBeenCalledWith(
      setup.ctx,
      "owner_123",
      "product_2",
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "avatar_doc_1",
      expect.objectContaining({
        productId: "product_2",
      }),
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith("photo_doc_1", {
      productId: "product_2",
      updatedAt: "2026-05-20T00:00:00.000Z",
    });
    expect(setup.ctx.db.patch).toHaveBeenCalledWith("photo_doc_2", {
      productId: "product_2",
      updatedAt: "2026-05-20T00:00:00.000Z",
    });
  });

  it("rejects blank avatar product links", async () => {
    const setup = createCtx([
      {
        _id: "avatar_doc_1",
        id: "avatar_1",
        name: "Nova",
      },
    ]);

    await expect(
      getHandler(update)(setup.ctx, {
        id: "avatar_1",
        name: "Nova",
        productId: "   ",
        updatedAt: "2026-05-20T00:00:00.000Z",
      }),
    ).rejects.toThrow("Choose a product before linking this avatar.");
  });
});
