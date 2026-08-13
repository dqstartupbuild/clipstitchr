"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudioClipsTaskSummary } from "./StudioClipsTaskSummary";
import { getStudioClipsTaskRequestMatches } from "./getStudioClipsTaskRequestMatches";
import { readStudioClipsJsonResponse } from "./readStudioClipsJsonResponse";

export function useStudioClipsTasks(
  productId: string | undefined,
  includeArchived: boolean,
) {
  const [loaded, setLoaded] = useState<{
    includeArchived: boolean;
    productId: string;
    reloadKey: number;
    tasks: StudioClipsTaskSummary[];
  } | null>(null);
  const [failure, setFailure] = useState<{
    includeArchived: boolean;
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
    const query = new URLSearchParams({
      productId,
      limit: "50",
      includeArchived: String(includeArchived),
    });

    void fetch(`/api/studio/clips/tasks?${query}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) =>
        readStudioClipsJsonResponse<{ tasks: StudioClipsTaskSummary[] }>(response),
      )
      .then((body) => {
        setLoaded({ includeArchived, productId, reloadKey, tasks: body.tasks });
        setFailure(null);
      })
      .catch((caught) => {
        if (!controller.signal.aborted) {
          setFailure({
            includeArchived,
            message: caught instanceof Error ? caught.message : "Unable to load clip tasks.",
            productId,
            reloadKey,
          });
        }
      });

    return () => controller.abort();
  }, [includeArchived, productId, reloadKey]);

  const requestIdentity = {
    includeArchived,
    productId: productId ?? "",
    reloadKey,
  };
  const tasks = getStudioClipsTaskRequestMatches(loaded, requestIdentity)
    ? loaded?.tasks ?? null
    : null;
  const error = getStudioClipsTaskRequestMatches(failure, requestIdentity)
    ? failure?.message ?? null
    : null;

  return { error, reload, tasks };
}
