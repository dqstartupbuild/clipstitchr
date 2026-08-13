"use client";

import { useCallback, useState } from "react";
import type { StudioStitchGenerationRun } from "./StudioStitchGenerationRun";
import { createStudioStitchClientId } from "./createStudioStitchClientId";
import { readStudioStitchJsonResponse } from "./readStudioStitchJsonResponse";

export function useCreateRemainingStudioStitchRun(
  productId: string | undefined,
) {
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createRemainingRun = useCallback(
    async (parentRunId: string) => {
      if (!productId) return null;
      setError(null);
      setIsCreating(true);
      try {
        const remainingRunId = createStudioStitchClientId("stitch_remaining");
        const response = await fetch(
          `/api/studio/stitch/runs/${encodeURIComponent(parentRunId)}/remaining`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId,
              remainingRunId,
              idempotencyKey: `create_${remainingRunId}`,
            }),
          },
        );
        return (
          await readStudioStitchJsonResponse<{
            created: boolean;
            run: StudioStitchGenerationRun;
          }>(response)
        ).run;
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to create the remaining batch.",
        );
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [productId],
  );

  return { createRemainingRun, error, isCreating };
}
