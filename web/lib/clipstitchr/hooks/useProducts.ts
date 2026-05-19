"use client";

import { useCallback, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createProductProfile } from "@/lib/clipstitchr/client/createProductProfile";
import { updateProductProfile } from "@/lib/clipstitchr/client/updateProductProfile";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

export function useProducts() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const productDocuments = useQuery(
    api.products.list,
    isAuthenticated ? {} : "skip",
  );
  const removeProductMutation = useMutation(api.products.remove);
  const [isCreating, setIsCreating] = useState(false);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const products = useMemo<ProductProfile[]>(
    () =>
      productDocuments?.map((product) => ({
        id: product.id,
        name: product.name,
        productDetails: product.productDetails,
        audienceDetails: product.audienceDetails,
        cliprPlaceholderFillers: product.cliprPlaceholderFillers,
        eligibleCliprHookStyleKeys: product.eligibleCliprHookStyleKeys,
        eligibleCliprHookTemplateIds: product.eligibleCliprHookTemplateIds,
        inferredProblem: product.inferredProblem,
        inferredPainPoints: product.inferredPainPoints,
        preferredCliprHookStyleKey: product.preferredCliprHookStyleKey,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })) ?? [],
    [productDocuments],
  );
  const createProduct = useCallback(async (input: ProductProfileCreateInput) => {
    setIsCreating(true);
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
      setIsCreating(false);
    }
  }, []);
  const updateProduct = useCallback(
    async (id: string, input: ProductProfileCreateInput) => {
      setSavingProductId(id);
      setError(null);

      try {
        return await updateProductProfile(id, input);
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to update this product.",
        );
        throw nextError;
      } finally {
        setSavingProductId(null);
      }
    },
    [],
  );
  const deleteProduct = useCallback(
    async (id: string) => {
      setDeletingProductId(id);
      setError(null);

      try {
        await removeProductMutation({ id });
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to delete this product.",
        );
        throw nextError;
      } finally {
        setDeletingProductId(null);
      }
    },
    [removeProductMutation],
  );

  return {
    products,
    isLoading:
      isAuthLoading || (isAuthenticated && productDocuments === undefined),
    isSaving: isCreating || savingProductId !== null,
    isCreating,
    savingProductId,
    deletingProductId,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
