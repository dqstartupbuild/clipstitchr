import { describe, expect, it, vi } from "vitest";
import { getStudioLazyReelResearchRunForOwnerProduct } from "./getStudioLazyReelResearchRunForOwnerProduct";

describe("getStudioLazyReelResearchRunForOwnerProduct", () => {
  it("binds run reads to owner, Product, and run ID in the index", async () => {
    const index = { eq: vi.fn() };
    index.eq.mockReturnValue(index);
    const query = {
      unique: vi.fn().mockResolvedValue(null),
      withIndex: vi.fn(
        (_name: string, applyIndex: (value: typeof index) => void) => {
          applyIndex(index);
          return query;
        },
      ),
    };
    const ctx = { db: { query: vi.fn(() => query) } };

    await getStudioLazyReelResearchRunForOwnerProduct(
      ctx as never,
      "owner_1",
      "product_1",
      "run_1",
    );

    expect(query.withIndex).toHaveBeenCalledWith(
      "by_owner_product_id",
      expect.any(Function),
    );
    expect(index.eq).toHaveBeenNthCalledWith(1, "ownerId", "owner_1");
    expect(index.eq).toHaveBeenNthCalledWith(2, "productId", "product_1");
    expect(index.eq).toHaveBeenNthCalledWith(3, "id", "run_1");
  });
});
