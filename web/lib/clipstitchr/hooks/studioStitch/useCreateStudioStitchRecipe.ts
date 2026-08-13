"use client";

import { useCallback, useState } from "react";
import type { StudioStitchRecipeRequest } from "@/lib/clipstitchr/server/studio/stitch/studioStitchRecipeRequestSchema";
import type { StudioStitchRecipeRecord } from "./StudioStitchRecipeRecord";
import { readStudioStitchJsonResponse } from "./readStudioStitchJsonResponse";

export function useCreateStudioStitchRecipe() {
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const createRecipe = useCallback(async (request: StudioStitchRecipeRequest) => {
    setError(null);
    setIsCreating(true);
    setStatusMessage("Saving the recipe...");
    try {
      const response = await fetch("/api/studio/stitch/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const result = await readStudioStitchJsonResponse<{
        created: boolean;
        recipe: StudioStitchRecipeRecord;
      }>(response);
      setStatusMessage(
        result.created
          ? "Recipe saved."
          : "That exact recipe request was already saved.",
      );
      return result.recipe;
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Unable to save this recipe.";
      setError(message);
      setStatusMessage(null);
      throw caught;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { createRecipe, error, isCreating, statusMessage };
}
