import { describe, expect, it, vi } from "vitest";
import { assertStudioLazyReelActiveProduct } from "./assertStudioLazyReelActiveProduct";

function createContext(result: unknown) {
  const index = { eq: vi.fn() };
  index.eq.mockReturnValue(index);
  const query = {
    unique: vi.fn().mockResolvedValue(result),
    withIndex: vi.fn(
      (_name: string, applyIndex: (value: typeof index) => void) => {
        applyIndex(index);
        return query;
      },
    ),
  };

  return {
    ctx: { db: { query: vi.fn(() => query) } },
    index,
  };
}

describe("assertStudioLazyReelActiveProduct", () => {
  it("queries with both authenticated owner and active Product ID", async () => {
    const product = { id: "product_1", ownerId: "owner_1" };
    const { ctx, index } = createContext(product);

    await expect(
      assertStudioLazyReelActiveProduct(
        ctx as never,
        "owner_1",
        "product_1",
      ),
    ).resolves.toBe(product);
    expect(index.eq).toHaveBeenNthCalledWith(1, "ownerId", "owner_1");
    expect(index.eq).toHaveBeenNthCalledWith(2, "id", "product_1");
  });

  it("rejects missing, cross-owner, or archived Products", async () => {
    const missing = createContext(null);
    await expect(
      assertStudioLazyReelActiveProduct(
        missing.ctx as never,
        "owner_1",
        "product_2",
      ),
    ).rejects.toThrow("Active Product not found");

    const archived = createContext({
      id: "product_1",
      ownerId: "owner_1",
      archivedAt: "2026-08-12T00:00:00.000Z",
    });
    await expect(
      assertStudioLazyReelActiveProduct(
        archived.ctx as never,
        "owner_1",
        "product_1",
      ),
    ).rejects.toThrow("Active Product not found");
  });
});
