"use client";

import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createHookLabCreativeBrief } from "@/lib/clipstitchr/client/createHookLabCreativeBrief";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import type { HookLabCreativeBrief } from "@/lib/clipstitchr/types/HookLabCreativeBrief";
import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

export function useHookLabProductAdaptation(sourcePostId: string) {
  const products = useDashboardProduct();
  const { isAuthenticated } = useConvexAuth();
  const updateBrief = useMutation(api.hookLabCreativeBriefs.update.update);
  const savedAdaptation = useQuery(
    api.hookLabCreativeBriefs.getLatestForSourcePost.getLatestForSourcePost,
    isAuthenticated ? { sourcePostId } : "skip",
  );
  const [localAdaptation, setLocalAdaptation] = useState<{
    brief: HookLabCreativeBrief;
    productName: string | null;
    sourcePostId: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const activeProduct = products.activeProduct;
  const currentLocalAdaptation =
    localAdaptation?.sourcePostId === sourcePostId ? localAdaptation : null;
  const brief =
    currentLocalAdaptation?.brief ??
    (savedAdaptation?.brief as HookLabCreativeBrief | undefined) ??
    null;
  const briefProductName =
    currentLocalAdaptation?.productName ??
    savedAdaptation?.productName ??
    null;
  const isLoadingBrief = Boolean(
    isAuthenticated && savedAdaptation === undefined && !currentLocalAdaptation,
  );
  const activeProductIsUsable = Boolean(
    activeProduct && !products.lockedProductIds.includes(activeProduct.id),
  );

  return {
    activeProduct,
    activeProductIsUsable,
    brief,
    briefProductName,
    error,
    isGenerating,
    isLoadingBrief,
    isSaving,
    savedMessage,
    generate: async () => {
      if (!activeProductIsUsable || !activeProduct) {
        setError(
          "Select an available product from the dashboard product picker first.",
        );
        return false;
      }

      setIsGenerating(true);
      setError(null);
      setSavedMessage(null);

      try {
        const result = await createHookLabCreativeBrief({
          productId: activeProduct.id,
          sourcePostId,
        });

        setLocalAdaptation({
          brief: result.brief,
          productName: activeProduct.name,
          sourcePostId,
        });
        setSavedMessage(`Created for ${activeProduct.name}.`);
        return true;
      } catch (nextError) {
        setError(
          getErrorMessage(
            nextError,
            "Unable to write this product adaptation.",
          ),
        );
        return false;
      } finally {
        setIsGenerating(false);
      }
    },
    saveEdits: async () => {
      if (!brief) {
        return false;
      }

      setIsSaving(true);
      setError(null);

      try {
        const updated = await updateBrief({ brief: brief.brief, id: brief.id });
        setLocalAdaptation({
          brief: updated as HookLabCreativeBrief,
          productName: briefProductName,
          sourcePostId,
        });
        setSavedMessage("Your edits are saved. No credit was charged.");
        return true;
      } catch (nextError) {
        setError(getErrorMessage(nextError, "Unable to save your edits."));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    updateContent: (
      key: keyof HookLabCreativeBriefContent,
      value: string | string[],
    ) => {
      if (!brief) {
        return;
      }

      setSavedMessage(null);
      setLocalAdaptation({
        brief: {
          ...brief,
          brief: { ...brief.brief, [key]: value },
        },
        productName: briefProductName,
        sourcePostId,
      });
    },
  };
}
