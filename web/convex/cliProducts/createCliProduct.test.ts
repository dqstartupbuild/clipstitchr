import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCliProduct } from "./createCliProduct";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertProductLimit: vi.fn(),
  assertRateLimitApiSecret: vi.fn(),
  assignLegacyRecordsToProduct: vi.fn(),
  getPrimaryProductForOwner: vi.fn(),
  mutation: vi.fn((definition) => definition),
  rateLimiter: { limit: vi.fn() },
  upsertProductCard: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../assignLegacyRecordsToProduct", () => ({
  assignLegacyRecordsToProduct: mocks.assignLegacyRecordsToProduct,
}));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));
vi.mock("../getPrimaryProductForOwner", () => ({
  getPrimaryProductForOwner: mocks.getPrimaryProductForOwner,
}));
vi.mock("../products/assertProductLimit", () => ({
  assertProductLimit: mocks.assertProductLimit,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: mocks.rateLimiter }));
vi.mock("../upsertProductCard", () => ({
  upsertProductCard: mocks.upsertProductCard,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createArgs() {
  return {
    audienceDetails: " Busy founders ",
    id: "product_123",
    name: " Launch Kit ",
    ownerId: "owner_123",
    productDetails: " AI launch planner ",
    secret: "rate-limit-secret",
  };
}

function createContext() {
  const indexQuery = { eq: vi.fn() };
  indexQuery.eq.mockReturnValue(indexQuery);
  const query = {
    unique: vi.fn(async () => null),
    withIndex: vi.fn(
      (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
        applyIndex(indexQuery);
        return query;
      },
    ),
  };

  return {
    db: {
      insert: vi.fn(async () => "document_123"),
      patch: vi.fn(),
      query: vi.fn(() => query),
    },
  };
}

describe("createCliProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPrimaryProductForOwner.mockResolvedValue({
      id: "product_existing",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("checks the owner's product entitlement before inserting", async () => {
    const serverNow = "2026-07-16T12:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(serverNow);
    const ctx = createContext();

    await expect(
      getHandler(createCliProduct)(ctx, createArgs()),
    ).resolves.toEqual({ id: "product_123", name: "Launch Kit" });

    expect(mocks.assertRateLimitApiSecret).toHaveBeenCalledWith(
      "rate-limit-secret",
    );
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexRecordSave",
      { key: "owner_123", throws: true },
    );
    expect(mocks.assertProductLimit).toHaveBeenCalledWith(
      ctx,
      "owner_123",
      serverNow,
    );
    expect(ctx.db.insert).toHaveBeenCalledWith("products", {
      audienceDetails: "Busy founders",
      createdAt: serverNow,
      id: "product_123",
      inferredPainPoints: [],
      name: "Launch Kit",
      ownerId: "owner_123",
      productDetails: "AI launch planner",
      updatedAt: serverNow,
    });
    expect(mocks.assertProductLimit.mock.invocationCallOrder[0]).toBeLessThan(
      ctx.db.insert.mock.invocationCallOrder[0],
    );
  });

  it.each([
    ["no entitlement", "SUBSCRIPTION_REQUIRED"],
    ["an inactive entitlement", "SUBSCRIPTION_INACTIVE"],
  ])("does not insert for %s", async (_case, code) => {
    const ctx = createContext();
    const error = Object.assign(new Error(code), { data: { code } });
    mocks.assertProductLimit.mockRejectedValueOnce(error);

    await expect(
      getHandler(createCliProduct)(ctx, createArgs()),
    ).rejects.toMatchObject({ data: { code } });

    expect(mocks.getPrimaryProductForOwner).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(mocks.upsertProductCard).not.toHaveBeenCalled();
  });
});
