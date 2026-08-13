"use client";

import { useCallback, useState } from "react";
import type { StudioStitchGenerationRun } from "./StudioStitchGenerationRun";
import type { StudioStitchRunAction } from "./StudioStitchRunAction";
import { createStudioStitchClientId } from "./createStudioStitchClientId";
import { readStudioStitchJsonResponse } from "./readStudioStitchJsonResponse";

export function useStudioStitchRunActions(productId: string | undefined) {
  const [busyAction, setBusyAction] = useState<StudioStitchRunAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateRun = useCallback(
    async (run: StudioStitchGenerationRun, action: StudioStitchRunAction) => {
      if (!productId) return null;
      setBusyAction(action);
      setError(null);
      try {
        const response = await fetch(
          `/api/studio/stitch/runs/${encodeURIComponent(run.id)}/${action}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId,
              expectedRevision: run.revision,
              idempotencyKey: createStudioStitchClientId(`${action}_run`),
            }),
          },
        );
        return (
          await readStudioStitchJsonResponse<{
            changed: boolean;
            run: StudioStitchGenerationRun;
          }>(response)
        ).run;
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Unable to update this run.",
        );
        return null;
      } finally {
        setBusyAction(null);
      }
    },
    [productId],
  );

  return { busyAction, error, updateRun };
}
