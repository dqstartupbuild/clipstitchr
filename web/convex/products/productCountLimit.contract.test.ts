import { describe, expect, it, vi } from "vitest";
import { assertProductLimit } from "./assertProductLimit";

const mocks = vi.hoisted(() => ({
  assertOwnerCanGenerate: vi.fn(),
}));

vi.mock("../billing/assertOwnerCanGenerate", () => ({
  assertOwnerCanGenerate: mocks.assertOwnerCanGenerate,
}));

function createContext(products: Array<{ archivedAt?: string }>) {
  const indexQuery = { eq: vi.fn() };
  indexQuery.eq.mockReturnValue(indexQuery);
  const query = {
    collect: vi.fn(async () => products),
    withIndex: vi.fn(
      (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
        applyIndex(indexQuery);
        return query;
      },
    ),
  };

  return { db: { query: vi.fn(() => query) } };
}

describe("product count plan contract", () => {
  it.each([
    ["starter", 1],
    ["pro", 3],
    ["agency", 10],
  ] as const)(
    "enforces the %s limit at %i active products",
    async (planKey, limit) => {
      mocks.assertOwnerCanGenerate.mockResolvedValue({ planKey });
      const belowLimit = Array.from(
        { length: Math.max(0, limit - 1) },
        () => ({}),
      );

      await expect(
        assertProductLimit(
          createContext(belowLimit) as never,
          "owner_123",
          "2026-07-16T12:00:00.000Z",
        ),
      ).resolves.toBeUndefined();

      await expect(
        assertProductLimit(
          createContext([...belowLimit, {}]) as never,
          "owner_123",
          "2026-07-16T12:00:00.000Z",
        ),
      ).rejects.toMatchObject({
        data: { code: "PRODUCT_LIMIT_REACHED", limit },
      });
    },
  );

  it("does not count archived products toward the active product limit", async () => {
    mocks.assertOwnerCanGenerate.mockResolvedValue({ planKey: "starter" });

    await expect(
      assertProductLimit(
        createContext([{ archivedAt: "2026-07-01T00:00:00.000Z" }]) as never,
        "owner_123",
        "2026-07-16T12:00:00.000Z",
      ),
    ).resolves.toBeUndefined();
  });

  it.each([
    ["no entitlement", "SUBSCRIPTION_REQUIRED"],
    ["an inactive entitlement", "SUBSCRIPTION_INACTIVE"],
  ])("rejects %s before counting products", async (_case, code) => {
    const error = Object.assign(new Error(code), { data: { code } });
    const ctx = createContext([]);
    mocks.assertOwnerCanGenerate.mockRejectedValueOnce(error);

    await expect(
      assertProductLimit(ctx as never, "owner_123", "2026-07-16T12:00:00.000Z"),
    ).rejects.toMatchObject({ data: { code } });
    expect(ctx.db.query).not.toHaveBeenCalled();
  });
});
