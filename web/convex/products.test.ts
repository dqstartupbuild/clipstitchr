import { beforeEach, describe, expect, it, vi } from "vitest";
import { create, get, list, remove, update } from "./products";

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
    withIndex: vi.fn((_indexName: string, callback: (q: typeof indexQuery) => void) => {
      callback(indexQuery);

      return chain;
    }),
  };

  return chain;
}

function createProductArgs(overrides: Record<string, unknown> = {}) {
  return {
    audienceDetails: " Busy founders ",
    cliprPlaceholderFillers: {
      " very long key that will be trimmed after forty characters ": [
        "  fast setup  ",
        "fast setup",
        "",
      ],
      empty: ["   "],
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    eligibleCliprHookStyleKeys: [" direct_diagnosis ", "direct_diagnosis"],
    eligibleCliprHookTemplateIds: [" APP-001 ", "APP-001", "APP-002"],
    id: "product_123",
    websiteUrl: "  https://launchkit.example.com/  ",
    inferredPainPoints: [
      "  slow launches  ",
      "",
      "duplicate",
      "duplicate",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
    ],
    inferredProblem: "  campaigns take too long  ",
    name: "  Launch Kit  ",
    preferredCliprHookStyleKey: " direct_diagnosis ",
    productDetails: "  AI launch planner  ",
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
}

describe("convex products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("lists products for the authenticated owner", async () => {
    const products = [{ _id: "doc_1", id: "product_1" }];
    const queryChain = createQueryChain({ collect: products });
    const ctx = {
      db: {
        query: vi.fn(() => queryChain),
      },
    };

    await expect(getHandler(list)(ctx, {})).resolves.toBe(products);
    expect(ctx.db.query).toHaveBeenCalledWith("products");
    expect(queryChain.withIndex).toHaveBeenCalledWith(
      "by_owner_created",
      expect.any(Function),
    );
    expect(queryChain.order).toHaveBeenCalledWith("desc");
  });

  it("normalizes product input before creating a product", async () => {
    const ctx = {
      db: {
        insert: vi.fn(async () => "doc_123"),
      },
    };

    await expect(getHandler(create)(ctx, createProductArgs())).resolves.toBe(
      "doc_123",
    );
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexRecordSave",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "products",
      expect.objectContaining({
        audienceDetails: "Busy founders",
        eligibleCliprHookStyleKeys: ["direct_diagnosis"],
        eligibleCliprHookTemplateIds: ["APP-001", "APP-002"],
        inferredPainPoints: [
          "slow launches",
          "duplicate",
          "duplicate",
          "one",
          "two",
          "three",
          "four",
          "five",
          "six",
          "seven",
        ],
        inferredProblem: "campaigns take too long",
        name: "Launch Kit",
        ownerId: "owner_123",
        preferredCliprHookStyleKey: "direct_diagnosis",
        productDetails: "AI launch planner",
        websiteUrl: "https://launchkit.example.com/",
      }),
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "products",
      expect.objectContaining({
        cliprPlaceholderFillers: {
          "very long key that will be trimmed after": ["fast setup"],
        },
      }),
    );
  });

  it("rejects blank product names before consuming create quota", async () => {
    const ctx = {
      db: {
        insert: vi.fn(),
      },
    };

    await expect(
      getHandler(create)(ctx, createProductArgs({ name: "   " })),
    ).rejects.toThrow("Product name is required.");
    expect(mocks.rateLimiter.limit).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("patches an existing product with normalized values", async () => {
    const product = { _id: "doc_123", id: "product_123" };
    const queryChain = createQueryChain({ unique: product });
    const ctx = {
      db: {
        patch: vi.fn(async () => undefined),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(getHandler(update)(ctx, createProductArgs())).resolves.toBe(
      undefined,
    );
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexMetadataUpdate",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "doc_123",
      expect.objectContaining({
        name: "Launch Kit",
        productDetails: "AI launch planner",
        websiteUrl: "https://launchkit.example.com/",
      }),
    );
  });

  it("throws when updating a missing product", async () => {
    const queryChain = createQueryChain();
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(getHandler(update)(ctx, createProductArgs())).rejects.toThrow(
      "Product not found.",
    );
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("gets one product by owner and product ID", async () => {
    const product = { _id: "doc_123", id: "product_123" };
    const queryChain = createQueryChain({ unique: product });
    const ctx = {
      db: {
        query: vi.fn(() => queryChain),
      },
    };

    await expect(
      getHandler<{ id: string }, unknown>(get)(ctx, { id: "product_123" }),
    ).resolves.toBe(product);
    expect(queryChain.withIndex).toHaveBeenCalledWith(
      "by_owner_id",
      expect.any(Function),
    );
  });

  it("deletes and returns an existing product", async () => {
    const product = { _id: "doc_123", id: "product_123" };
    const queryChain = createQueryChain({ unique: product });
    const ctx = {
      db: {
        delete: vi.fn(async () => undefined),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(getHandler(remove)(ctx, { id: "product_123" })).resolves.toBe(
      product,
    );
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexRecordDelete",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.delete).toHaveBeenCalledWith("doc_123");
  });

  it("clears the default product preference when deleting the default product", async () => {
    const product = { _id: "doc_123", id: "product_123" };
    const preferences = {
      _id: "pref_doc",
      defaultProductId: "product_123",
    };
    const productQuery = createQueryChain({ unique: product });
    const preferenceQuery = createQueryChain({ unique: preferences });
    const ctx = {
      db: {
        delete: vi.fn(async () => undefined),
        patch: vi.fn(async () => undefined),
        query: vi.fn((tableName: string) =>
          tableName === "products" ? productQuery : preferenceQuery,
        ),
      },
    };

    await expect(getHandler(remove)(ctx, { id: "product_123" })).resolves.toBe(
      product,
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "pref_doc",
      expect.objectContaining({
        defaultProductId: undefined,
      }),
    );
    expect(ctx.db.delete).toHaveBeenCalledWith("doc_123");
  });

  it("returns null when removing a missing product", async () => {
    const queryChain = createQueryChain();
    const ctx = {
      db: {
        delete: vi.fn(),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(
      getHandler<{ id: string }, unknown>(remove)(ctx, { id: "missing" }),
    ).resolves.toBeNull();
    expect(ctx.db.delete).not.toHaveBeenCalled();
  });
});
