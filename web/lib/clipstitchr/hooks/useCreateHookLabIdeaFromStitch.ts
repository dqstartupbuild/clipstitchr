"use client";

import { useCallback, useState } from "react";
import { createHookLabIdea } from "@/lib/clipstitchr/client/createHookLabIdea";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

export function useCreateHookLabIdeaFromStitch() {
  const [error, setError] = useState<string | null>(null);
  const [savingStitchId, setSavingStitchId] = useState<string | null>(null);
  const createIdeaFromStitch = useCallback(async (stitch: Stitch) => {
    setError(null);
    setSavingStitchId(stitch.id);

    try {
      await createHookLabIdea({
        productId: stitch.productId,
        scope: stitch.productId ? "product" : "shared",
        stitchId: stitch.id,
      });
    } catch (nextError) {
      setError(
        getErrorMessage(nextError, "Couldn’t save this Stitch as an Idea."),
      );
      throw nextError;
    } finally {
      setSavingStitchId(null);
    }
  }, []);

  return {
    createIdeaFromStitch,
    error,
    savingStitchId,
  };
}
