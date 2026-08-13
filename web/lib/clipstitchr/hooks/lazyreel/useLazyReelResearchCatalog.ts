"use client";

import { useCallback, useEffect, useState } from "react";
import type { LazyReelResearchCatalogResponse } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchCatalogResponse";
import type { LazyReelResearchCatalogState } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchCatalogState";
import { readLazyReelClientResponseError } from "./readLazyReelClientResponseError";

export function useLazyReelResearchCatalog(
  productId?: string,
): LazyReelResearchCatalogState {
  const [loaded, setLoaded] = useState<{
    productId: string;
    reloadKey: number;
    response: LazyReelResearchCatalogResponse;
  } | null>(null);
  const [failure, setFailure] = useState<{
    productId: string;
    reloadKey: number;
    message: string;
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    if (!productId) {
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        const response = await fetch(
          `/api/studio/research/catalog?productId=${encodeURIComponent(productId)}`,
          { method: "GET", signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(await readLazyReelClientResponseError(response));
        }

        const body = (await response.json()) as LazyReelResearchCatalogResponse;

        if (!body.catalog || !Array.isArray(body.workflows)) {
          throw new Error("The research catalog response was incomplete.");
        }

        setLoaded({ productId, reloadKey, response: body });
        setFailure(null);
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        setFailure({
          productId,
          reloadKey,
          message:
            requestError instanceof Error
              ? requestError.message
              : "The research catalog could not be loaded.",
        });
      }
    })();

    return () => controller.abort();
  }, [productId, reloadKey]);

  const catalogResponse =
    productId &&
    loaded?.productId === productId &&
    loaded.reloadKey === reloadKey
      ? loaded.response
      : null;
  const error =
    productId &&
    failure?.productId === productId &&
    failure.reloadKey === reloadKey
      ? failure.message
      : null;
  const isLoading = Boolean(productId) && !catalogResponse && !error;

  return { catalogResponse, error, isLoading, reload };
}
