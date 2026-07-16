import { beforeEach, describe, expect, it, vi } from "vitest";
import { create, get, list, remove, update } from "./products";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertProductLimit: vi.fn(),
  deleteProductCard: vi.fn(),
  disableProductAutomation: vi.fn(),
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

vi.mock("./products/assertProductLimit", () => ({
  assertProductLimit: mocks.assertProductLimit,
}));

vi.mock("./deleteProductCard", () => ({
  deleteProductCard: mocks.deleteProductCard,
}));

vi.mock("./products/disableProductAutomation", () => ({
  disableProductAutomation: mocks.disableProductAutomation,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(
  options: {
    collect?: unknown[];
    unique?: unknown;
  } = {},
) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    collect: vi.fn(async () => options.collect ?? []),
    first: vi.fn(async () => options.unique ?? null),
    order: vi.fn(() => chain),
    take: vi.fn(async () => options.collect ?? []),
    unique: vi.fn(async () => options.unique ?? null),
    withIndex: vi.fn(
      (_indexName: string, callback: (q: typeof indexQuery) => void) => {
        callback(indexQuery);

        return chain;
      },
    ),
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
    emotionalNarrative: "  Founders want to stop feeling behind  ",
    eligibleCliprHookStyleKeys: [" direct_diagnosis ", "direct_diagnosis"],
    eligibleCliprHookTemplateIds: [" APP-001 ", "APP-001", "APP-002"],
    id: "product_123",
    websiteUrl: "  https://launchkit.example.com/  ",
    hookEdgeLevel: " bold ",
    hookGenerationGoal: " comments ",
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
    rejectedHookExamples: ["  Stop scrolling  ", "Stop scrolling", ""],
    updatedAt: "2026-05-20T00:00:00.000Z",
    winningHookExamples: [
      "  This launch got away from me  ",
      "This launch got away from me",
      "I thought launch day would feel calmer",
    ],
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

    await expect(getHandler(list)(ctx, {})).resolves.toEqual(products);
    expect(ctx.db.query).toHaveBeenCalledWith("products");
    expect(queryChain.withIndex).toHaveBeenCalledWith(
      "by_owner_created",
      expect.any(Function),
    );
    expect(queryChain.order).toHaveBeenCalledWith("desc");
  });

  it("normalizes product input before creating a product", async () => {
    const queryChain = createQueryChain();
    const ctx = {
      db: {
        insert: vi.fn(async () => "doc_123"),
        patch: vi.fn(async () => undefined),
        query: vi.fn(() => queryChain),
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
        emotionalNarrative: "Founders want to stop feeling behind",
        eligibleCliprHookStyleKeys: ["direct_diagnosis"],
        eligibleCliprHookTemplateIds: ["APP-001", "APP-002"],
        hookEdgeLevel: "bold",
        hookGenerationGoal: "comments",
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
        rejectedHookExamples: ["Stop scrolling"],
        websiteUrl: "https://launchkit.example.com/",
        winningHookExamples: [
          "This launch got away from me",
          "I thought launch day would feel calmer",
        ],
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
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "productPreferences",
      expect.objectContaining({
        defaultProductId: "product_123",
        ownerId: "owner_123",
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
        emotionalNarrative: "Founders want to stop feeling behind",
        hookEdgeLevel: "bold",
        hookGenerationGoal: "comments",
        name: "Launch Kit",
        productDetails: "AI launch planner",
        rejectedHookExamples: ["Stop scrolling"],
        websiteUrl: "https://launchkit.example.com/",
        winningHookExamples: [
          "This launch got away from me",
          "I thought launch day would feel calmer",
        ],
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

  it("archives and returns an existing product", async () => {
    const product = { _id: "doc_123", id: "product_123" };
    const queryChain = createQueryChain({ unique: product });
    const ctx = {
      db: {
        patch: vi.fn(async () => undefined),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(
      getHandler(remove)(ctx, { id: "product_123" }),
    ).resolves.toEqual(
      expect.objectContaining({ archivedAt: expect.any(String) }),
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
      expect.objectContaining({ archivedAt: expect.any(String) }),
    );
    expect(mocks.deleteProductCard).toHaveBeenCalledWith(ctx, product);
    expect(mocks.disableProductAutomation).toHaveBeenCalledWith(
      ctx,
      "owner_123",
      "product_123",
      expect.any(String),
    );
  });

  it("clears the default product preference when archiving the default product", async () => {
    const product = { _id: "doc_123", id: "product_123" };
    const preferences = {
      _id: "pref_doc",
      defaultProductId: "product_123",
    };
    const productQuery = createQueryChain({ unique: product });
    const preferenceQuery = createQueryChain({ unique: preferences });
    const ctx = {
      db: {
        patch: vi.fn(async () => undefined),
        query: vi.fn((tableName: string) =>
          tableName === "products" ? productQuery : preferenceQuery,
        ),
      },
    };

    await expect(
      getHandler(remove)(ctx, { id: "product_123" }),
    ).resolves.toEqual(expect.objectContaining({ id: "product_123" }));
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "pref_doc",
      expect.objectContaining({
        defaultProductId: undefined,
      }),
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "doc_123",
      expect.objectContaining({ archivedAt: expect.any(String) }),
    );
  });

  it("returns null when removing a missing product", async () => {
    const queryChain = createQueryChain();
    const ctx = {
      db: {
        query: vi.fn(() => queryChain),
      },
    };

    await expect(
      getHandler<{ id: string }, unknown>(remove)(ctx, { id: "missing" }),
    ).resolves.toBeNull();
    expect(mocks.deleteProductCard).not.toHaveBeenCalled();
  });
});
