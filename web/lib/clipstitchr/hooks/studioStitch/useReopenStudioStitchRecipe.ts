"use client";

import { useCallback, useState } from "react";
import type { StudioStitchRecipeRecord } from "./StudioStitchRecipeRecord";
import { createStudioStitchClientId } from "./createStudioStitchClientId";
import { readStudioStitchJsonResponse } from "./readStudioStitchJsonResponse";

export function useReopenStudioStitchRecipe(productId: string | undefined) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reopen = useCallback(
    async (recipe: StudioStitchRecipeRecord) => {
      if (!productId) return null;
      setBusyId(recipe.id);
      setError(null);
      try {
        const response = await fetch(
          `/api/studio/stitch/recipes/${encodeURIComponent(recipe.id)}/reopen`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId,
              expectedRevision: recipe.revision,
              idempotencyKey: createStudioStitchClientId("reopen_recipe"),
            }),
          },
        );
        return (
          await readStudioStitchJsonResponse<{
            changed: boolean;
            recipe: StudioStitchRecipeRecord;
          }>(response)
        ).recipe;
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Unable to reopen this recipe.",
        );
        return null;
      } finally {
        setBusyId(null);
      }
    },
    [productId],
  );

  return { busyId, error, reopen };
}
