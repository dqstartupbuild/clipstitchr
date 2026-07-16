import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { archiveProduct } from "./archiveProduct";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  deleteProductCard: vi.fn(),
  disableProductAutomation: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  rateLimiter: { limit: vi.fn() },
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../deleteProductCard", () => ({
  deleteProductCard: mocks.deleteProductCard,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: mocks.rateLimiter }));
vi.mock("./disableProductAutomation", () => ({
  disableProductAutomation: mocks.disableProductAutomation,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext() {
  const results = new Map<string, unknown>([
    [
      "products",
      { _id: "product_doc", id: "product_1", ownerId: "owner_123" },
    ],
    [
      "productPreferences",
      {
        _id: "preferences_doc",
        defaultProductId: "product_1",
        ownerId: "owner_123",
      },
    ],
  ]);

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn((table: string) => {
        const indexQuery = { eq: vi.fn() };
        indexQuery.eq.mockReturnValue(indexQuery);
        const query = {
          unique: vi.fn(async () => results.get(table) ?? null),
          withIndex: vi.fn(
            (
              _name: string,
              applyIndex: (value: typeof indexQuery) => unknown,
            ) => {
              applyIndex(indexQuery);
              return query;
            },
          ),
        };

        return query;
      }),
    },
  };
}

describe("archiveProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("records archival and automation shutdown with server time", async () => {
    const serverNow = "2026-07-16T12:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(serverNow);
    const ctx = createContext();

    await getHandler(archiveProduct)(ctx, {
      id: "product_1",
      now: "2099-01-01T00:00:00.000Z",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith("product_doc", {
      archivedAt: serverNow,
      updatedAt: serverNow,
    });
    expect(mocks.disableProductAutomation).toHaveBeenCalledWith(
      ctx,
      "owner_123",
      "product_1",
      serverNow,
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "preferences_doc",
      expect.objectContaining({ updatedAt: serverNow }),
    );
  });
});
