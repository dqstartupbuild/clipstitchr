"use client";

import { useCallback, useState } from "react";
import type { StudioStitchGenerationRun } from "./StudioStitchGenerationRun";
import type { StudioStitchReviewSubset } from "./StudioStitchReviewSubset";
import { createStudioStitchClientId } from "./createStudioStitchClientId";
import { readStudioStitchJsonResponse } from "./readStudioStitchJsonResponse";

export function useCreateStudioStitchRun(productId: string | undefined) {
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createRun = useCallback(
    async (recipeIds: readonly string[], reviewCount: number) => {
      if (!productId) return null;
      setError(null);
      setIsCreating(true);
      try {
        const runId = createStudioStitchClientId("stitch_run");
        const response = await fetch("/api/studio/stitch/runs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            runId,
            reviewSubsetId: createStudioStitchClientId("stitch_review"),
            productId,
            recipeIds,
            reviewCount,
            idempotencyKey: `create_${runId}`,
          }),
        });
        return await readStudioStitchJsonResponse<{
          created: boolean;
          run: StudioStitchGenerationRun;
          reviewSubset: StudioStitchReviewSubset;
        }>(response);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to create this sample run.",
        );
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [productId],
  );

  return { createRun, error, isCreating };
}
