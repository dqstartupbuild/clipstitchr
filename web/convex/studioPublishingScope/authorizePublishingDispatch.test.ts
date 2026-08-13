import { beforeEach, describe, expect, it, vi } from "vitest";
import { authorizePublishingDispatch } from "./authorizePublishingDispatch";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  access: vi.fn(),
  assertSecret: vi.fn(),
  limit: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertSecret,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: { limit: mocks.limit } }));
vi.mock("../studioBetaAccess/getStudioBetaAccessStateForOwner", () => ({
  getStudioBetaAccessStateForOwner: mocks.access,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(input: {
  product?: { id: string; archivedAt?: number } | null;
}) {
  const productQuery = {
    unique: vi.fn(async () => input.product ?? null),
    withIndex: vi.fn(),
  };
  productQuery.withIndex.mockImplementation((_name, apply) => {
    const index = { eq: vi.fn() };
    index.eq.mockReturnValue(index);
    apply(index);
    return productQuery;
  });
  return {
    db: {
      query: vi.fn(() => productQuery),
    },
  };
}

describe("studioPublishingScope.authorizePublishingDispatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.access.mockResolvedValue({ hasAccess: true });
  });

  it("allows only a currently opted-in owner and their selected active Product", async () => {
    const ctx = createContext({
      product: { id: "product_1" },
    });

    await expect(
      getHandler(authorizePublishingDispatch)(ctx, {
        ownerId: "user_1",
        productId: "product_1",
        secret: "rate-secret",
      }),
    ).resolves.toEqual({ allowed: true });
    expect(mocks.assertSecret).toHaveBeenCalledWith("rate-secret");
    expect(mocks.access).toHaveBeenCalledWith(ctx, "user_1");
    expect(mocks.limit).toHaveBeenNthCalledWith(
      1,
      ctx,
      "studioPublishingStaticRead",
      { key: "user_1", throws: true },
    );
    expect(mocks.limit).toHaveBeenNthCalledWith(
      2,
      ctx,
      "studioPublishingStaticReadGlobal",
      { throws: true },
    );
  });

  it.each([
    ["revoked grant or opt-out", { access: false, product: { id: "product_1" } }],
    ["archived Product", { access: true, product: { id: "product_1", archivedAt: 1 } }],
    ["missing Product", { access: true, product: null }],
  ])("denies %s before reserving dispatch capacity", async (_label, state) => {
    mocks.access.mockResolvedValue({ hasAccess: state.access });
    const ctx = createContext({
      product: state.product,
    });

    await expect(
      getHandler(authorizePublishingDispatch)(ctx, {
        ownerId: "user_1",
        productId: "product_1",
        secret: "rate-secret",
      }),
    ).resolves.toEqual({ allowed: false });
    expect(mocks.limit).not.toHaveBeenCalled();
  });
});
