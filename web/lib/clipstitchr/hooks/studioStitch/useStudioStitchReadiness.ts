"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudioStitchReadiness } from "./StudioStitchReadiness";
import { readStudioStitchJsonResponse } from "./readStudioStitchJsonResponse";

export function useStudioStitchReadiness(productId: string | undefined) {
  const [state, setState] = useState<{
    productId: string;
    readiness: StudioStitchReadiness;
  } | null>(null);
  const [failure, setFailure] = useState<{
    productId: string;
    message: string;
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    const query = new URLSearchParams({ productId });

    void fetch(`/api/studio/stitch/readiness?${query}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) =>
        readStudioStitchJsonResponse<StudioStitchReadiness>(response),
      )
      .then((readiness) => {
        setState({ productId, readiness });
        setFailure(null);
      })
      .catch((caught) => {
        if (!controller.signal.aborted) {
          setFailure({
            productId,
            message:
              caught instanceof Error
                ? caught.message
                : "Unable to check provider readiness.",
          });
        }
      });

    return () => controller.abort();
  }, [productId, reloadKey]);

  const error =
    failure && failure.productId === productId ? failure.message : null;
  const readiness =
    state && state.productId === productId ? state.readiness : null;

  return {
    error,
    isLoading: Boolean(productId && !readiness && !error),
    readiness,
    reload,
  };
}
