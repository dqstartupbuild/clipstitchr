import { describe, expect, it, vi } from "vitest";
import { assertStudioBetaR2ActiveProduct } from "./assertStudioBetaR2ActiveProduct";

function createContext(product: Record<string, unknown> | null) {
  const unique = vi.fn().mockResolvedValue(product);
  const eqProduct = vi.fn(() => ({ unique }));
  const eqOwner = vi.fn(() => ({ eq: eqProduct }));
  const withIndex = vi.fn((_name, callback) => callback({ eq: eqOwner }));
  const query = vi.fn(() => ({ withIndex }));

  return { context: { db: { query } }, eqOwner, eqProduct };
}

describe("assertStudioBetaR2ActiveProduct", () => {
  it("returns the active Product owned by the authenticated subject", async () => {
    const product = { id: "product_1", ownerId: "owner_1" };
    const { context, eqOwner, eqProduct } = createContext(product);

    await expect(
      assertStudioBetaR2ActiveProduct(
        context as never,
        "owner_1",
        "product_1",
      ),
    ).resolves.toBe(product);
    expect(eqOwner).toHaveBeenCalledWith("ownerId", "owner_1");
    expect(eqProduct).toHaveBeenCalledWith("id", "product_1");
  });

  it("rejects missing and archived Products", async () => {
    await expect(
      assertStudioBetaR2ActiveProduct(
        createContext(null).context as never,
        "owner_1",
        "product_1",
      ),
    ).rejects.toThrow("Active Product not found.");
    await expect(
      assertStudioBetaR2ActiveProduct(
        createContext({ archivedAt: "2026-08-12", id: "product_1" })
          .context as never,
        "owner_1",
        "product_1",
      ),
    ).rejects.toThrow("Active Product not found.");
  });
});
