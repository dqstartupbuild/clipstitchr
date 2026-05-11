"use client";

import { useCallback, useMemo, useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createProductProfile } from "@/lib/clipstitchr/client/createProductProfile";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

export function useProducts() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const productDocuments = useQuery(
    api.products.list,
    isAuthenticated ? {} : "skip",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const products = useMemo<ProductProfile[]>(
    () =>
      productDocuments?.map((product) => ({
        id: product.id,
        name: product.name,
        productDetails: product.productDetails,
        audienceDetails: product.audienceDetails,
        inferredProblem: product.inferredProblem,
        inferredPainPoints: product.inferredPainPoints,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })) ?? [],
    [productDocuments],
  );
  const createProduct = useCallback(async (input: ProductProfileCreateInput) => {
    setIsSaving(true);
    setError(null);

    try {
      return await createProductProfile(input);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save this product.",
      );
      throw nextError;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    products,
    isLoading:
      isAuthLoading || (isAuthenticated && productDocuments === undefined),
    isSaving,
    error,
    createProduct,
  };
}
