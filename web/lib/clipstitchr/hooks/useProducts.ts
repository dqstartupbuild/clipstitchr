"use client";

import { useCallback, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createProductProfile } from "@/lib/clipstitchr/client/createProductProfile";
import { updateProductProfile } from "@/lib/clipstitchr/client/updateProductProfile";
import { stripWebsiteSourcedProductDetails } from "@/lib/clipstitchr/utils/stripWebsiteSourcedProductDetails";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

export function useProducts() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const productDocuments = useQuery(
    api.products.list,
    isAuthenticated ? {} : "skip",
  );
  const productPreferences = useQuery(
    api.productPreferences.get,
    isAuthenticated ? {} : "skip",
  );
  const removeProductMutation = useMutation(api.products.remove);
  const setDefaultProductMutation = useMutation(
    api.productPreferences.setDefaultProduct,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );
  const [defaultingProductId, setDefaultingProductId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const products = useMemo<ProductProfile[]>(
    () =>
      productDocuments?.map((product) => ({
        id: product.id,
        name: product.name,
        productDetails: stripWebsiteSourcedProductDetails(product.productDetails),
        audienceDetails: product.audienceDetails,
        emotionalNarrative: product.emotionalNarrative,
        websiteUrl: product.websiteUrl,
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
  const preferredDefaultProductId = productPreferences?.defaultProductId;
  const defaultProductId =
    preferredDefaultProductId &&
    products.some((product) => product.id === preferredDefaultProductId)
      ? preferredDefaultProductId
      : undefined;
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
  const setDefaultProduct = useCallback(
    async (product: ProductProfile) => {
      setDefaultingProductId(product.id);
      setError(null);

      try {
        await setDefaultProductMutation({
          productId: product.id,
          updatedAt: new Date().toISOString(),
        });
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to update the default product.",
        );
        throw nextError;
      } finally {
        setDefaultingProductId(null);
      }
    },
    [setDefaultProductMutation],
  );

  return {
    products,
    defaultProductId,
    isLoading:
      isAuthLoading ||
      (isAuthenticated &&
        (productDocuments === undefined || productPreferences === undefined)),
    isSaving:
      isCreating || savingProductId !== null || defaultingProductId !== null,
    isCreating,
    savingProductId,
    deletingProductId,
    defaultingProductId,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    setDefaultProduct,
  };
}
