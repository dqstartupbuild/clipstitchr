import { describe, expect, it, vi } from "vitest";
import { getProductAccessStateForOwner } from "./getProductAccessStateForOwner";

function createContext(options: {
  entitlement?: Record<string, unknown> | null;
  products: Array<Record<string, unknown>>;
  preferences?: Record<string, unknown> | null;
}) {
  const query = vi.fn((table: string) => {
    const indexQuery = { eq: vi.fn(() => indexQuery) };
    const value =
      table === "products"
        ? options.products
        : table === "productPreferences"
          ? (options.preferences ?? null)
          : (options.entitlement ?? null);
    const chain = {
      collect: vi.fn(async () => value),
      take: vi.fn(async () => value),
      unique: vi.fn(async () => value),
      withIndex: vi.fn(
        (_indexName: string, callback: (query: typeof indexQuery) => void) => {
          callback(indexQuery);
          return chain;
        },
      ),
    };

    return chain;
  });

  return { db: { query } } as never;
}

const products = [
  { archivedAt: undefined, createdAt: "2026-01-01", id: "oldest" },
  { archivedAt: undefined, createdAt: "2026-01-02", id: "default" },
  { archivedAt: undefined, createdAt: "2026-01-03", id: "newest" },
];

describe("getProductAccessStateForOwner", () => {
  it("keeps only the saved default unlocked on Starter", async () => {
    const access = await getProductAccessStateForOwner(
      createContext({
        entitlement: { planKey: "starter" },
        preferences: { defaultProductId: "default" },
        products,
      }),
      "owner_1",
      "2026-07-16T00:00:00.000Z",
    );

    expect(access).toEqual({
      defaultProductId: "default",
      isProductLimitReached: true,
      lockedProductIds: ["oldest", "newest"],
      planName: "Starter",
      productLimit: 1,
    });
  });

  it("unlocks the default plus the oldest remaining products on Pro", async () => {
    const access = await getProductAccessStateForOwner(
      createContext({
        entitlement: { planKey: "pro" },
        preferences: { defaultProductId: "newest" },
        products: [
          ...products,
          { archivedAt: undefined, createdAt: "2026-01-04", id: "fourth" },
        ],
      }),
      "owner_1",
      "2026-07-16T00:00:00.000Z",
    );

    expect(access.lockedProductIds).toEqual(["fourth"]);
    expect(access.productLimit).toBe(3);
  });

  it("does not invent plan locks before an entitlement exists", async () => {
    const access = await getProductAccessStateForOwner(
      createContext({ products }),
      "owner_1",
      "2026-07-16T00:00:00.000Z",
    );

    expect(access.lockedProductIds).toEqual([]);
    expect(access.planName).toBeNull();
    expect(access.productLimit).toBeNull();
  });
});
