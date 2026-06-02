import { beforeEach, describe, expect, it, vi } from "vitest";
import { get, setDefaultProduct } from "./productPreferences";

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

function createQueryChain(options: { unique?: unknown } = {}) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    unique: vi.fn(async () => options.unique ?? null),
    withIndex: vi.fn((_indexName: string, callback: (q: typeof indexQuery) => void) => {
      callback(indexQuery);

      return chain;
    }),
  };

  return chain;
}

describe("product preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("gets preferences for the authenticated owner", async () => {
    const preferences = {
      _id: "pref_doc",
      defaultProductId: "product_1",
    };
    const queryChain = createQueryChain({ unique: preferences });
    const ctx = {
      db: {
        query: vi.fn(() => queryChain),
      },
    };

    await expect(getHandler(get)(ctx, {})).resolves.toBe(preferences);
    expect(ctx.db.query).toHaveBeenCalledWith("productPreferences");
    expect(queryChain.withIndex).toHaveBeenCalledWith(
      "by_owner",
      expect.any(Function),
    );
  });

  it("sets the default product after validating ownership", async () => {
    const product = { _id: "product_doc", id: "product_1" };
    const preferences = { _id: "pref_doc", defaultProductId: "old_product" };
    const productQuery = createQueryChain({ unique: product });
    const preferenceQuery = createQueryChain({ unique: preferences });
    const ctx = {
      db: {
        insert: vi.fn(),
        patch: vi.fn(async () => undefined),
        query: vi.fn((tableName: string) =>
          tableName === "products" ? productQuery : preferenceQuery,
        ),
      },
    };

    await expect(
      getHandler(setDefaultProduct)(ctx, {
        productId: "product_1",
        updatedAt: "2026-06-01T00:00:00.000Z",
      }),
    ).resolves.toBe("pref_doc");
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexMetadataUpdate",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.patch).toHaveBeenCalledWith("pref_doc", {
      ownerId: "owner_123",
      defaultProductId: "product_1",
      updatedAt: "2026-06-01T00:00:00.000Z",
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("creates preferences when none exist", async () => {
    const product = { _id: "product_doc", id: "product_1" };
    const productQuery = createQueryChain({ unique: product });
    const preferenceQuery = createQueryChain();
    const ctx = {
      db: {
        insert: vi.fn(async () => "pref_doc"),
        query: vi.fn((tableName: string) =>
          tableName === "products" ? productQuery : preferenceQuery,
        ),
      },
    };

    await expect(
      getHandler(setDefaultProduct)(ctx, {
        productId: "product_1",
        updatedAt: "2026-06-01T00:00:00.000Z",
      }),
    ).resolves.toBe("pref_doc");
    expect(ctx.db.insert).toHaveBeenCalledWith("productPreferences", {
      ownerId: "owner_123",
      defaultProductId: "product_1",
      updatedAt: "2026-06-01T00:00:00.000Z",
    });
  });

  it("rejects missing products before writing preferences", async () => {
    const productQuery = createQueryChain();
    const ctx = {
      db: {
        insert: vi.fn(),
        patch: vi.fn(),
        query: vi.fn(() => productQuery),
      },
    };

    await expect(
      getHandler(setDefaultProduct)(ctx, {
        productId: "missing_product",
        updatedAt: "2026-06-01T00:00:00.000Z",
      }),
    ).rejects.toThrow("Product not found.");
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
