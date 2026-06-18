"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCreateDialog } from "@/app/_components/products/ProductCreateDialog";
import { DashboardProductContext } from "@/lib/clipstitchr/context/DashboardProductContext";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

type DashboardProductProviderProps = {
  children: ReactNode;
};

export function DashboardProductProvider({
  children,
}: DashboardProductProviderProps) {
  const { isAuthenticated } = useConvexAuth();
  const products = useProducts();
  const setupState = useQuery(
    api.products.getSetupState,
    isAuthenticated ? {} : "skip",
  );
  const assignLegacyContentToPrimary = useMutation(
    api.products.assignLegacyContentToPrimary,
  );
  const [isBackfillingLegacyContent, setIsBackfillingLegacyContent] =
    useState(false);
  const activeProduct = useMemo(
    () =>
      products.products.find(
        (product) => product.id === products.defaultProductId,
      ) ?? products.products[0],
    [products.defaultProductId, products.products],
  );
  const requiresProductSetup =
    setupState?.requiresProductSetup === true && !products.isLoading;
  const createProduct = useCallback(
    async (input: ProductProfileCreateInput): Promise<ProductProfile> => {
      const product = await products.createProduct(input);

      await products.setDefaultProduct(product);

      return product;
    },
    [products],
  );
  const setActiveProduct = useCallback(
    async (product: ProductProfile) => {
      await products.setDefaultProduct(product);
    },
    [products],
  );

  useEffect(() => {
    if (
      !setupState?.primaryProductId ||
      !setupState.hasLegacyContent ||
      isBackfillingLegacyContent
    ) {
      return;
    }

    setIsBackfillingLegacyContent(true);
    void assignLegacyContentToPrimary({
      updatedAt: new Date().toISOString(),
    }).finally(() => setIsBackfillingLegacyContent(false));
  }, [assignLegacyContentToPrimary, isBackfillingLegacyContent, setupState]);

  const value = useMemo(
    () => ({
      activeProduct,
      activeProductId: activeProduct?.id,
      defaultProductId: products.defaultProductId,
      error: products.error,
      isBackfillingLegacyContent,
      isCreating: products.isCreating,
      isLoading:
        products.isLoading || (isAuthenticated && setupState === undefined),
      isSaving: products.isSaving,
      products: products.products,
      requiresProductSetup,
      createProduct,
      setActiveProduct,
      updateProduct: products.updateProduct,
    }),
    [
      activeProduct,
      createProduct,
      isAuthenticated,
      isBackfillingLegacyContent,
      products.defaultProductId,
      products.error,
      products.isCreating,
      products.isLoading,
      products.isSaving,
      products.products,
      products.updateProduct,
      requiresProductSetup,
      setActiveProduct,
      setupState,
    ],
  );

  return (
    <DashboardProductContext.Provider value={value}>
      {children}
      {requiresProductSetup ? (
        <ProductCreateDialog
          isRequired
          isSaving={products.isCreating}
          onCreate={createProduct}
        />
      ) : null}
    </DashboardProductContext.Provider>
  );
}
