"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudioClipsCapabilities } from "./StudioClipsCapabilities";
import { readStudioClipsJsonResponse } from "./readStudioClipsJsonResponse";

export function useStudioClipsCapabilities(productId: string | undefined) {
  const [loaded, setLoaded] = useState<{
    capabilities: StudioClipsCapabilities;
    productId: string;
    reloadKey: number;
  } | null>(null);
  const [failure, setFailure] = useState<{
    message: string;
    productId: string;
    reloadKey: number;
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    if (!productId) {
      return;
    }

    const controller = new AbortController();

    void fetch(`/api/studio/clips/capabilities?productId=${encodeURIComponent(productId)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => readStudioClipsJsonResponse<StudioClipsCapabilities>(response))
      .then((capabilities) => {
        setLoaded({ capabilities, productId, reloadKey });
        setFailure(null);
      })
      .catch((caught) => {
        if (!controller.signal.aborted) {
          setFailure({
            message: caught instanceof Error ? caught.message : "Unable to open Studio Clips.",
            productId,
            reloadKey,
          });
        }
      });

    return () => controller.abort();
  }, [productId, reloadKey]);

  const capabilities =
    loaded !== null &&
    loaded.productId === productId &&
    loaded.reloadKey === reloadKey
      ? loaded.capabilities
      : null;
  const error =
    failure !== null &&
    failure.productId === productId &&
    failure.reloadKey === reloadKey
      ? failure.message
      : null;

  return {
    capabilities,
    error,
    isLoading: Boolean(productId) && !capabilities && !error,
    reload,
  };
}
