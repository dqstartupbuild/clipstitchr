"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { StudioEditorMediaSourceCatalog } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceCatalog";

const emptyCatalog: StudioEditorMediaSourceCatalog = {
  videoClips: [],
  stitches: [],
};

export function useStudioEditorSourceCatalog(productId: string | undefined) {
  const listSources = useMutation(api.studioEditorMedia.listSources.listSources);
  const [catalog, setCatalog] = useState<StudioEditorMediaSourceCatalog>(emptyCatalog);
  const [isLoading, setIsLoading] = useState(Boolean(productId));
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!productId) {
      setCatalog(emptyCatalog);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setCatalog(await listSources({ productId, limitPerKind: 40 }));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to open the source library.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [listSources, productId]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void reload();
    });
    return () => {
      active = false;
    };
  }, [reload]);

  return { catalog, error, isLoading, reload };
}
