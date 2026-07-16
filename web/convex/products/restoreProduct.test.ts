import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { restoreProduct } from "./restoreProduct";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertProductLimit: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  rateLimiter: { limit: vi.fn() },
  upsertProductCard: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: mocks.rateLimiter }));
vi.mock("../upsertProductCard", () => ({
  upsertProductCard: mocks.upsertProductCard,
}));
vi.mock("./assertProductLimit", () => ({
  assertProductLimit: mocks.assertProductLimit,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(product: unknown) {
  const indexQuery = { eq: vi.fn() };
  indexQuery.eq.mockReturnValue(indexQuery);
  const query = {
    unique: vi.fn(async () => product),
    withIndex: vi.fn(
      (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
        applyIndex(indexQuery);
        return query;
      },
    ),
  };

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn(() => query),
    },
  };
}

describe("restoreProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cannot use a historical client timestamp to restore after entitlement expiry", async () => {
    const serverNow = "2026-07-16T12:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(serverNow);
    mocks.assertProductLimit.mockImplementationOnce(
      async (_ctx: unknown, _ownerId: string, checkedAt: string) => {
        expect(checkedAt).toBe(serverNow);
        throw new Error("Subscription inactive");
      },
    );
    const ctx = createContext({
      _id: "product_doc",
      archivedAt: "2026-07-01T00:00:00.000Z",
      id: "product_1",
      ownerId: "owner_123",
    });

    await expect(
      getHandler(restoreProduct)(ctx, {
        id: "product_1",
        now: "2000-01-01T00:00:00.000Z",
      }),
    ).rejects.toThrow("Subscription inactive");
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("uses server time for the restored product lifecycle", async () => {
    const serverNow = "2026-07-16T12:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(serverNow);
    const ctx = createContext({
      _id: "product_doc",
      archivedAt: "2026-07-01T00:00:00.000Z",
      id: "product_1",
      ownerId: "owner_123",
    });

    await getHandler(restoreProduct)(ctx, {
      id: "product_1",
      now: "2099-01-01T00:00:00.000Z",
    });

    expect(mocks.assertProductLimit).toHaveBeenCalledWith(
      ctx,
      "owner_123",
      serverNow,
    );
    expect(ctx.db.patch).toHaveBeenCalledWith("product_doc", {
      archivedAt: undefined,
      updatedAt: serverNow,
    });
  });
});
