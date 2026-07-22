"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createHookLabCreativeBrief } from "@/lib/clipstitchr/client/createHookLabCreativeBrief";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import type { HookLabCreativeBrief } from "@/lib/clipstitchr/types/HookLabCreativeBrief";
import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

export function useHookLabProductAdaptation(sourcePostId: string) {
  const products = useDashboardProduct();
  const updateBrief = useMutation(api.hookLabCreativeBriefs.update.update);
  const [brief, setBrief] = useState<HookLabCreativeBrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const activeProduct = products.activeProduct;
  const activeProductIsUsable = Boolean(
    activeProduct && !products.lockedProductIds.includes(activeProduct.id),
  );

  return {
    activeProduct,
    activeProductIsUsable,
    brief,
    error,
    isGenerating,
    isSaving,
    savedMessage,
    generate: async () => {
      if (!activeProductIsUsable || !activeProduct) {
        setError(
          "Select an available product from the dashboard product picker first.",
        );
        return;
      }

      setIsGenerating(true);
      setError(null);
      setSavedMessage(null);

      try {
        const result = await createHookLabCreativeBrief({
          productId: activeProduct.id,
          sourcePostId,
        });

        setBrief(result.brief);
        setSavedMessage(`Created for ${activeProduct.name}.`);
      } catch (nextError) {
        setError(
          getErrorMessage(
            nextError,
            "Unable to write this product adaptation.",
          ),
        );
      } finally {
        setIsGenerating(false);
      }
    },
    saveEdits: async () => {
      if (!brief) {
        return;
      }

      setIsSaving(true);
      setError(null);

      try {
        const updated = await updateBrief({ brief: brief.brief, id: brief.id });
        setBrief(updated as HookLabCreativeBrief);
        setSavedMessage("Your edits are saved. No credit was charged.");
      } catch (nextError) {
        setError(getErrorMessage(nextError, "Unable to save your edits."));
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
      setBrief({
        ...brief,
        brief: { ...brief.brief, [key]: value },
      });
    },
  };
}
