import { beforeEach, describe, expect, it, vi } from "vitest";
import { consumeStaticRead } from "./consumeStaticRead";

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
vi.mock("../studioLazyReel/assertStudioLazyReelActiveProduct", () => ({
  assertStudioLazyReelActiveProduct: mocks.activeProduct,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("studioLazyReelRateLimits.consumeStaticRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
  });

  it("asserts access and Product ownership before owner and global limits", async () => {
    const ctx = {};

    await expect(
      getHandler(consumeStaticRead)(ctx, { productId: "product_1" }),
    ).resolves.toEqual({ reserved: true });
    expect(mocks.assertAccess).toHaveBeenCalledWith(ctx, "owner_1");
    expect(mocks.activeProduct).toHaveBeenCalledWith(
      ctx,
      "owner_1",
      "product_1",
    );
    expect(mocks.limit).toHaveBeenNthCalledWith(
      1,
      ctx,
      "studioLazyReelStaticRead",
      { key: "owner_1", throws: true },
    );
    expect(mocks.limit).toHaveBeenNthCalledWith(
      2,
      ctx,
      "studioLazyReelStaticReadGlobal",
      { throws: true },
    );
  });
});
