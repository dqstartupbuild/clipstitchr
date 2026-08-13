import { beforeEach, describe, expect, it, vi } from "vitest";
import { getActiveProductScope } from "./getActiveProductScope";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  activeProduct: vi.fn(),
  assertAccess: vi.fn(),
  auth: vi.fn(),
  limit: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.auth,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: { limit: mocks.limit } }));
vi.mock("../studioBetaAccess/assertStudioBetaAccess", () => ({
  assertStudioBetaAccess: mocks.assertAccess,
}));
vi.mock("./assertStudioPublishingActiveProduct", () => ({
  assertStudioPublishingActiveProduct: mocks.activeProduct,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(defaultProductId?: string) {
  const query = {
    unique: vi.fn().mockResolvedValue(
      defaultProductId ? { defaultProductId, ownerId: "owner_1" } : null,
    ),
    withIndex: vi.fn(),
  };
  query.withIndex.mockImplementation((_name, apply) => {
    const index = { eq: vi.fn() };
    index.eq.mockReturnValue(index);
    apply(index);
    return query;
  });
  return { db: { query: vi.fn(() => query) } };
}

describe("studioPublishingScope.getActiveProductScope", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
    mocks.activeProduct.mockResolvedValue({
      id: "product_1",
      name: "Everyday bottle",
    });
  });

  it("returns only the authenticated owner and active Product scope", async () => {
    const ctx = createContext("product_1");

    await expect(getHandler(getActiveProductScope)(ctx, {})).resolves.toEqual({
      ownerId: "owner_1",
      productId: "product_1",
      productName: "Everyday bottle",
    });
    expect(mocks.assertAccess).toHaveBeenCalledWith(ctx, "owner_1");
    expect(mocks.activeProduct).toHaveBeenCalledWith(
      ctx,
      "owner_1",
      "product_1",
    );
    expect(mocks.limit).toHaveBeenNthCalledWith(
      1,
      ctx,
      "studioPublishingStaticRead",
      { key: "owner_1", throws: true },
    );
    expect(mocks.limit).toHaveBeenNthCalledWith(
      2,
      ctx,
      "studioPublishingStaticReadGlobal",
      { throws: true },
    );
  });

  it("fails closed before rate-limit reservation when no Product is active", async () => {
    const ctx = createContext();

    await expect(getHandler(getActiveProductScope)(ctx, {})).rejects.toThrow(
      "Choose an active Product",
    );
    expect(mocks.activeProduct).not.toHaveBeenCalled();
    expect(mocks.limit).not.toHaveBeenCalled();
  });
});
