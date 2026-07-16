import { describe, expect, it, vi } from "vitest";
import { assertDailyDraftProductLimit } from "./assertDailyDraftProductLimit";

const mocks = vi.hoisted(() => ({
  assertOwnerCanGenerate: vi.fn(),
}));

vi.mock("../billing/assertOwnerCanGenerate", () => ({
  assertOwnerCanGenerate: mocks.assertOwnerCanGenerate,
}));

function createContext(productIds: string[]) {
  const indexQuery = { eq: vi.fn() };
  indexQuery.eq.mockReturnValue(indexQuery);
  const query = {
    collect: vi.fn(async () =>
      productIds.map((productId) => ({ enabled: true, productId })),
    ),
    withIndex: vi.fn(
      (_name: string, applyIndex: (value: typeof indexQuery) => unknown) => {
        applyIndex(indexQuery);
        return query;
      },
    ),
  };

  return { db: { query: vi.fn(() => query) } };
}

describe("daily automation draft product limit contract", () => {
  it("keeps daily drafts unavailable on Starter", async () => {
    mocks.assertOwnerCanGenerate.mockResolvedValue({ planKey: "starter" });

    await expect(
      assertDailyDraftProductLimit(
        createContext([]) as never,
        "owner_123",
        "product_1",
        "2026-07-16T12:00:00.000Z",
      ),
    ).rejects.toMatchObject({
      data: { code: "DAILY_DRAFT_PRODUCT_LIMIT_REACHED", limit: 0 },
    });
  });

  it.each([
    ["pro", 1],
    ["agency", 10],
  ] as const)(
    "enforces the %s allowance across %i distinct products",
    async (planKey, limit) => {
      mocks.assertOwnerCanGenerate.mockResolvedValue({ planKey });
      const enabledProductIds = Array.from(
        { length: limit },
        (_value, index) => `product_${index + 1}`,
      );

      await expect(
        assertDailyDraftProductLimit(
          createContext(enabledProductIds.slice(0, limit - 1)) as never,
          "owner_123",
          "next_product",
          "2026-07-16T12:00:00.000Z",
        ),
      ).resolves.toBeUndefined();

      await expect(
        assertDailyDraftProductLimit(
          createContext(enabledProductIds) as never,
          "owner_123",
          "next_product",
          "2026-07-16T12:00:00.000Z",
        ),
      ).rejects.toMatchObject({
        data: { code: "DAILY_DRAFT_PRODUCT_LIMIT_REACHED", limit },
      });
    },
  );

  it("does not count the product being updated as another enabled product", async () => {
    mocks.assertOwnerCanGenerate.mockResolvedValue({ planKey: "pro" });

    await expect(
      assertDailyDraftProductLimit(
        createContext(["product_1"]) as never,
        "owner_123",
        "product_1",
        "2026-07-16T12:00:00.000Z",
      ),
    ).resolves.toBeUndefined();
  });
});
