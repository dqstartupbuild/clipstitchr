import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import { api } from "@/convex/_generated/api";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const mocks = vi.hoisted(() => ({
  createProductProfile: vi.fn(),
  removeProductMutation: vi.fn(),
  setDefaultProductMutation: vi.fn(),
  stateSetter: vi.fn(),
  updateProductProfile: vi.fn(),
  useConvexAuth: vi.fn(),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useMemo: (callback: () => unknown) => callback(),
  useState: (initialValue: unknown) => [
    typeof initialValue === "function"
      ? (initialValue as () => unknown)()
      : initialValue,
    mocks.stateSetter,
  ],
}));

vi.mock("convex/react", () => ({
  useConvexAuth: mocks.useConvexAuth,
  useMutation: mocks.useMutation,
  useQuery: mocks.useQuery,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    products: {
      list: "products.list",
      remove: "products.remove",
    },
    productPreferences: {
      get: "productPreferences.get",
      setDefaultProduct: "productPreferences.setDefaultProduct",
    },
  },
}));

vi.mock("@/lib/clipstitchr/client/createProductProfile", () => ({
  createProductProfile: mocks.createProductProfile,
}));

vi.mock("@/lib/clipstitchr/client/updateProductProfile", () => ({
  updateProductProfile: mocks.updateProductProfile,
}));

function createProductDocument(
  overrides: Partial<ProductProfile> = {},
): ProductProfile {
  return {
    audienceDetails: "Founders",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: ["slow launch"],
    inferredProblem: "campaigns take too long",
    name: "Launch Kit",
    productDetails: "AI launch planner",
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
}

describe("useProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    mocks.useMutation.mockImplementation((mutationId) =>
      mutationId === api.productPreferences.setDefaultProduct
        ? mocks.setDefaultProductMutation
        : mocks.removeProductMutation,
    );
    mocks.useQuery.mockImplementation((queryId) =>
      queryId === api.productPreferences.get
        ? { defaultProductId: "product_1" }
        : [createProductDocument()],
    );
    mocks.createProductProfile.mockResolvedValue(createProductDocument());
    mocks.updateProductProfile.mockResolvedValue(createProductDocument());
    mocks.removeProductMutation.mockResolvedValue(undefined);
    mocks.setDefaultProductMutation.mockResolvedValue(undefined);
  });

  it("maps product documents and queries only when authenticated", () => {
    mocks.useQuery.mockImplementation((queryId) =>
      queryId === api.productPreferences.get
        ? { defaultProductId: "product_1" }
        : [
            createProductDocument({
              productDetails:
                "AI launch planner\n\nWebsite-sourced details:\nOld page copy",
            }),
          ],
    );

    const state = useProducts();

    expect(state.products).toEqual([
      expect.objectContaining({
        audienceDetails: "Founders",
        id: "product_1",
        name: "Launch Kit",
        productDetails: "AI launch planner",
      }),
    ]);
    expect(state.defaultProductId).toBe("product_1");
    expect(state.isLoading).toBe(false);
    expect(mocks.useQuery).toHaveBeenCalledWith(api.products.list, {});
    expect(mocks.useQuery).toHaveBeenCalledWith(api.productPreferences.get, {});
    expect(mocks.useMutation).toHaveBeenCalledWith(api.products.remove);
    expect(mocks.useMutation).toHaveBeenCalledWith(
      api.productPreferences.setDefaultProduct,
    );
  });

  it("skips product loading while unauthenticated", () => {
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    mocks.useQuery.mockReturnValue(undefined);

    const state = useProducts();

    expect(state.products).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(mocks.useQuery).toHaveBeenCalledWith(api.products.list, "skip");
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.productPreferences.get,
      "skip",
    );
  });

  it("creates, updates, defaults, and deletes products with saving state transitions", async () => {
    const state = useProducts();
    const input = {
      audienceDetails: "Founders",
      name: "Launch Kit",
      productDetails: "AI launch planner",
    };

    await expect(state.createProduct(input)).resolves.toEqual(
      expect.objectContaining({ id: "product_1" }),
    );
    await expect(state.updateProduct("product_1", input)).resolves.toEqual(
      expect.objectContaining({ id: "product_1" }),
    );
    await expect(state.deleteProduct("product_1")).resolves.toBeUndefined();
    await expect(
      state.setDefaultProduct(createProductDocument()),
    ).resolves.toBeUndefined();

    expect(mocks.createProductProfile).toHaveBeenCalledWith(input);
    expect(mocks.updateProductProfile).toHaveBeenCalledWith(
      "product_1",
      input,
    );
    expect(mocks.removeProductMutation).toHaveBeenCalledWith({
      id: "product_1",
    });
    expect(mocks.setDefaultProductMutation).toHaveBeenCalledWith({
      productId: "product_1",
      updatedAt: expect.any(String),
    });
    expect(mocks.stateSetter).toHaveBeenCalledWith(true);
    expect(mocks.stateSetter).toHaveBeenCalledWith("product_1");
    expect(mocks.stateSetter).toHaveBeenCalledWith(null);
  });

  it("surfaces create, update, and delete failures", async () => {
    mocks.createProductProfile.mockRejectedValueOnce(
      new Error("create failed"),
    );
    mocks.updateProductProfile.mockRejectedValueOnce(new Error("update failed"));
    mocks.removeProductMutation.mockRejectedValueOnce(new Error("delete failed"));
    mocks.setDefaultProductMutation.mockRejectedValueOnce(
      new Error("default failed"),
    );
    const state = useProducts();
    const input = {
      audienceDetails: "Founders",
      name: "Launch Kit",
      productDetails: "AI launch planner",
    };

    await expect(state.createProduct(input)).rejects.toThrow("create failed");
    await expect(state.updateProduct("product_1", input)).rejects.toThrow(
      "update failed",
    );
    await expect(state.deleteProduct("product_1")).rejects.toThrow(
      "delete failed",
    );
    await expect(
      state.setDefaultProduct(createProductDocument()),
    ).rejects.toThrow("default failed");

    expect(mocks.stateSetter).toHaveBeenCalledWith("create failed");
    expect(mocks.stateSetter).toHaveBeenCalledWith("update failed");
    expect(mocks.stateSetter).toHaveBeenCalledWith("delete failed");
    expect(mocks.stateSetter).toHaveBeenCalledWith("default failed");
  });

  it("ignores stale default product preferences", () => {
    mocks.useQuery.mockImplementation((queryId) =>
      queryId === api.productPreferences.get
        ? { defaultProductId: "missing_product" }
        : [createProductDocument()],
    );

    const state = useProducts();

    expect(state.defaultProductId).toBeUndefined();
  });
});
