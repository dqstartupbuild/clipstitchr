"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudioStitchRecipeRecord } from "./StudioStitchRecipeRecord";
import { readStudioStitchJsonResponse } from "./readStudioStitchJsonResponse";

export function useStudioStitchRecipes(
  productId: string | undefined,
  includeArchived: boolean,
  refreshKey = 0,
) {
  const [state, setState] = useState<{
    requestKey: string;
    recipes: StudioStitchRecipeRecord[] | null;
    error: string | null;
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((value) => value + 1), []);
  const requestKey = `${productId ?? ""}:${includeArchived}:${refreshKey}:${reloadKey}`;

  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    const query = new URLSearchParams({
      productId,
      includeArchived: String(includeArchived),
    });

    void fetch(`/api/studio/stitch/recipes?${query}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) =>
        readStudioStitchJsonResponse<StudioStitchRecipeRecord[]>(response),
      )
      .then((records) => {
        setState({ requestKey, recipes: records, error: null });
      })
      .catch((caught) => {
        if (!controller.signal.aborted) {
          setState({
            requestKey,
            recipes: null,
            error:
              caught instanceof Error
                ? caught.message
                : "Unable to load saved recipes.",
          });
        }
      });

    return () => controller.abort();
  }, [includeArchived, productId, refreshKey, reloadKey, requestKey]);

  const isCurrent = state?.requestKey === requestKey;
  return {
    error: isCurrent ? state.error : null,
    isLoading: Boolean(productId && !isCurrent),
    recipes: isCurrent ? state.recipes : null,
    reload,
  };
}
