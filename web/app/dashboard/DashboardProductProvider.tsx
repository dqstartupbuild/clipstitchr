"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { DashboardGateState } from "@/app/_components/dashboard/DashboardGateState";
import { ProductCreateDialog } from "@/app/_components/products/ProductCreateDialog";
import { ProductPlanLimitDialog } from "@/app/_components/products/ProductPlanLimitDialog";
import { DashboardProductContext } from "@/lib/clipstitchr/context/DashboardProductContext";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";
import type { ProductLimitDialogReason } from "@/lib/clipstitchr/types/ProductLimitDialogReason";

type DashboardProductProviderProps = {
  children: ReactNode;
};

export function DashboardProductProvider({
  children,
}: DashboardProductProviderProps) {
  const { isAuthenticated } = useConvexAuth();
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const products = useProducts();
  const setupState = useQuery(
    api.products.getSetupState,
    isAuthenticated ? {} : "skip",
  );
  const assignLegacyContentToPrimary = useMutation(
    api.products.assignLegacyContentToPrimary,
  );
  const [localOnboardingCompletedAt, setLocalOnboardingCompletedAt] = useState<
    string | null
  >(null);
  const [isBackfillingLegacyContent, setIsBackfillingLegacyContent] =
    useState(false);
  const [productLimitDialogReason, setProductLimitDialogReason] =
    useState<ProductLimitDialogReason | null>(null);
  const activeProduct = useMemo(
    () =>
      products.products.find(
        (product) => product.id === products.defaultProductId,
      ) ?? products.products[0],
    [products.defaultProductId, products.products],
  );
  const requiresProductSetup =
    setupState?.requiresProductSetup === true && !products.isLoading;
  const requiresOnboarding =
    setupState?.requiresOnboarding === true && !localOnboardingCompletedAt;
  const isOnboardingRoute = pathname.startsWith("/dashboard/onboarding");
  const isDashboardGateLoading =
    isAuthenticated && (setupState === undefined || products.isLoading);
  const shouldBlockDashboard =
    !isOnboardingRoute && (isDashboardGateLoading || requiresOnboarding);
  const shouldShowRequiredProductDialog =
    requiresProductSetup &&
    !requiresOnboarding &&
    !isOnboardingRoute &&
    !shouldBlockDashboard;
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
  const markOnboardingCompletedLocally = useCallback((completedAt: string) => {
    setLocalOnboardingCompletedAt(completedAt);
  }, []);

  useEffect(() => {
    if (requiresOnboarding && !isOnboardingRoute) {
      router.replace("/dashboard/onboarding");
    }
  }, [isOnboardingRoute, requiresOnboarding, router]);

  useEffect(() => {
    let isActive = true;

    if (
      !setupState?.primaryProductId ||
      !setupState.hasLegacyContent ||
      isBackfillingLegacyContent
    ) {
      return () => {
        isActive = false;
      };
    }

    void (async () => {
      setIsBackfillingLegacyContent(true);

      try {
        await assignLegacyContentToPrimary({
          updatedAt: new Date().toISOString(),
        });
      } finally {
        if (isActive) {
          setIsBackfillingLegacyContent(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [assignLegacyContentToPrimary, isBackfillingLegacyContent, setupState]);

  const value = useMemo(
    () => ({
      activeProduct,
      activeProductId: activeProduct?.id,
      archivedProducts: products.archivedProducts,
      defaultProductId: products.defaultProductId,
      defaultingProductId: products.defaultingProductId,
      deletingProductId: products.deletingProductId,
      error: products.error,
      isBackfillingLegacyContent,
      isCreating: products.isCreating,
      isLoading:
        products.isLoading || (isAuthenticated && setupState === undefined),
      isProductLimitReached: products.isProductLimitReached,
      isSaving: products.isSaving,
      lockedProductIds: products.lockedProductIds,
      planName: products.planName,
      productLimit: products.productLimit,
      products: products.products,
      restoringProductId: products.restoringProductId,
      requiresOnboarding,
      requiresProductSetup,
      savingProductId: products.savingProductId,
      createProduct,
      deleteProduct: products.deleteProduct,
      markOnboardingCompletedLocally,
      restoreProduct: products.restoreProduct,
      setActiveProduct,
      showProductPlanLimitDialog: setProductLimitDialogReason,
      updateProduct: products.updateProduct,
    }),
    [
      activeProduct,
      createProduct,
      isAuthenticated,
      isBackfillingLegacyContent,
      products.defaultProductId,
      products.archivedProducts,
      products.defaultingProductId,
      products.deleteProduct,
      products.deletingProductId,
      products.error,
      products.isCreating,
      products.isLoading,
      products.isProductLimitReached,
      products.isSaving,
      products.lockedProductIds,
      products.planName,
      products.productLimit,
      products.products,
      products.restoreProduct,
      products.restoringProductId,
      requiresOnboarding,
      markOnboardingCompletedLocally,
      products.savingProductId,
      products.updateProduct,
      requiresProductSetup,
      setActiveProduct,
      setupState,
    ],
  );

  return (
    <DashboardProductContext.Provider value={value}>
      {shouldBlockDashboard ? (
        <DashboardGateState
          message={
            requiresOnboarding
              ? "Taking you to your first batch setup..."
              : "Preparing your workspace..."
          }
        />
      ) : (
        children
      )}
      {shouldShowRequiredProductDialog ? (
        <ProductCreateDialog
          isRequired
          isSaving={products.isCreating}
          onCreate={createProduct}
        />
      ) : null}
      {productLimitDialogReason ? (
        <ProductPlanLimitDialog
          planName={products.planName}
          productLimit={products.productLimit}
          reason={productLimitDialogReason}
          onClose={() => setProductLimitDialogReason(null)}
        />
      ) : null}
    </DashboardProductContext.Provider>
  );
}
