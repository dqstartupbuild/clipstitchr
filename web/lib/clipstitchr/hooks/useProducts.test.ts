import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import { api } from "@/convex/_generated/api";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const mocks = vi.hoisted(() => ({
  createProductProfile: vi.fn(),
  archiveProductMutation: vi.fn(),
  restoreProductMutation: vi.fn(),
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
      archiveProduct: { archiveProduct: "products.archiveProduct" },
      list: "products.list",
      listArchivedProducts: {
        listArchivedProducts: "products.listArchivedProducts",
      },
      getProductAccessState: {
        getProductAccessState: "products.getProductAccessState",
      },
      restoreProduct: { restoreProduct: "products.restoreProduct" },
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
    mocks.useMutation.mockImplementation((mutationId) => {
      if (mutationId === api.productPreferences.setDefaultProduct) {
        return mocks.setDefaultProductMutation;
      }

      return mutationId === api.products.restoreProduct.restoreProduct
        ? mocks.restoreProductMutation
        : mocks.archiveProductMutation;
    });
    mocks.useQuery.mockImplementation((queryId) => {
      if (queryId === api.products.getProductAccessState.getProductAccessState) {
        return {
          defaultProductId: "product_1",
          isProductLimitReached: false,
          lockedProductIds: [],
          planName: "Starter",
          productLimit: 1,
        };
      }

      if (queryId === api.productPreferences.get) {
        return { defaultProductId: "product_1" };
      }

      return queryId === api.products.listArchivedProducts.listArchivedProducts
        ? []
        : [createProductDocument()];
    });
    mocks.createProductProfile.mockResolvedValue(createProductDocument());
    mocks.updateProductProfile.mockResolvedValue(createProductDocument());
    mocks.archiveProductMutation.mockResolvedValue(undefined);
    mocks.restoreProductMutation.mockResolvedValue(undefined);
    mocks.setDefaultProductMutation.mockResolvedValue(undefined);
  });

  it("maps product documents and queries only when authenticated", () => {
    mocks.useQuery.mockImplementation((queryId) =>
      queryId === api.productPreferences.get
        ? { defaultProductId: "product_1" }
        : queryId === api.products.listArchivedProducts.listArchivedProducts
          ? []
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
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.products.getProductAccessState.getProductAccessState,
      {},
    );
    expect(mocks.useQuery).toHaveBeenCalledWith(api.productPreferences.get, {});
    expect(mocks.useMutation).toHaveBeenCalledWith(
      api.products.archiveProduct.archiveProduct,
    );
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
      api.products.listArchivedProducts.listArchivedProducts,
      "skip",
    );
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.productPreferences.get,
      "skip",
    );
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.products.getProductAccessState.getProductAccessState,
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
    await expect(state.restoreProduct("product_1")).resolves.toBeUndefined();
    await expect(
      state.setDefaultProduct(createProductDocument()),
    ).resolves.toBeUndefined();

    expect(mocks.createProductProfile).toHaveBeenCalledWith(input);
    expect(mocks.updateProductProfile).toHaveBeenCalledWith("product_1", input);
    expect(mocks.archiveProductMutation).toHaveBeenCalledWith({
      id: "product_1",
      now: expect.any(String),
    });
    expect(mocks.restoreProductMutation).toHaveBeenCalledWith({
      id: "product_1",
      now: expect.any(String),
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
    mocks.updateProductProfile.mockRejectedValueOnce(
      new Error("update failed"),
    );
    mocks.archiveProductMutation.mockRejectedValueOnce(
      new Error("delete failed"),
    );
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

  it("falls back to the first product when the default product preference is stale", () => {
    mocks.useQuery.mockImplementation((queryId) =>
      queryId === api.productPreferences.get
        ? { defaultProductId: "missing_product" }
        : queryId === api.products.listArchivedProducts.listArchivedProducts
          ? []
          : [createProductDocument()],
    );

    const state = useProducts();

    expect(state.defaultProductId).toBe("product_1");
  });
});
