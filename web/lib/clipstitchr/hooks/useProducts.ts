"use client";

import { useCallback, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
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
  const productPreferences = useQuery(
    api.productPreferences.get,
    isAuthenticated ? {} : "skip",
  );
  const archivedProductDocuments = useQuery(
    api.products.listArchivedProducts.listArchivedProducts,
    isAuthenticated ? {} : "skip",
  );
  const archiveProductMutation = useMutation(
    api.products.archiveProduct.archiveProduct,
  );
  const restoreProductMutation = useMutation(
    api.products.restoreProduct.restoreProduct,
  );
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
  const [restoringProductId, setRestoringProductId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const products = useMemo<ProductProfile[]>(
    () => productDocuments?.map(createProductProfileFromConvexDocument) ?? [],
    [productDocuments],
  );
  const archivedProducts = useMemo<ProductProfile[]>(
    () =>
      archivedProductDocuments?.map(createProductProfileFromConvexDocument) ??
      [],
    [archivedProductDocuments],
  );
  const preferredDefaultProductId = productPreferences?.defaultProductId;
  const defaultProductId =
    preferredDefaultProductId &&
    products.some((product) => product.id === preferredDefaultProductId)
      ? preferredDefaultProductId
      : products[0]?.id;
  const createProduct = useCallback(
    async (input: ProductProfileCreateInput) => {
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
    },
    [],
  );
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
        await archiveProductMutation({ id, now: new Date().toISOString() });
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to archive this product.",
        );
        throw nextError;
      } finally {
        setDeletingProductId(null);
      }
    },
    [archiveProductMutation],
  );
  const restoreProduct = useCallback(
    async (id: string) => {
      setRestoringProductId(id);
      setError(null);

      try {
        await restoreProductMutation({ id, now: new Date().toISOString() });
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to restore this product.",
        );
        throw nextError;
      } finally {
        setRestoringProductId(null);
      }
    },
    [restoreProductMutation],
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
    archivedProducts,
    defaultProductId,
    isLoading:
      isAuthLoading ||
      (isAuthenticated &&
        (productDocuments === undefined ||
          archivedProductDocuments === undefined ||
          productPreferences === undefined)),
    isSaving:
      isCreating ||
      savingProductId !== null ||
      defaultingProductId !== null ||
      restoringProductId !== null,
    isCreating,
    savingProductId,
    deletingProductId,
    defaultingProductId,
    restoringProductId,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    setDefaultProduct,
  };
}
