"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudioStitchGenerationRun } from "./StudioStitchGenerationRun";
import { readStudioStitchJsonResponse } from "./readStudioStitchJsonResponse";

export function useStudioStitchRun(
  productId: string | undefined,
  runId: string | null,
) {
  const [state, setState] = useState<{
    requestKey: string;
    run: StudioStitchGenerationRun | null;
    error: string | null;
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((value) => value + 1), []);
  const requestKey = `${productId ?? ""}:${runId ?? ""}:${reloadKey}`;

  useEffect(() => {
    if (!productId || !runId) return;
    const controller = new AbortController();
    const query = new URLSearchParams({ productId });

    void fetch(
      `/api/studio/stitch/runs/${encodeURIComponent(runId)}?${query}`,
      { cache: "no-store", signal: controller.signal },
    )
      .then((response) =>
        readStudioStitchJsonResponse<{
          run: StudioStitchGenerationRun | null;
        }>(response),
      )
      .then((payload) => {
        if (!payload.run) {
          throw new Error("Generation run not found for this Product.");
        }
        setState({ requestKey, run: payload.run, error: null });
      })
      .catch((caught) => {
        if (!controller.signal.aborted) {
          setState({
            requestKey,
            run: null,
            error:
              caught instanceof Error
                ? caught.message
                : "Unable to load this run.",
          });
        }
      });

    return () => controller.abort();
  }, [productId, reloadKey, requestKey, runId]);

  const isCurrent = state?.requestKey === requestKey;
  return {
    error: isCurrent ? state.error : null,
    isLoading: Boolean(productId && runId && !isCurrent),
    reload,
    run: isCurrent ? state.run : null,
  };
}
