"use client";

import { useCallback, useEffect, useState } from "react";
import { getStudioStitchRunStorageKey } from "./getStudioStitchRunStorageKey";

const EMPTY_STUDIO_STITCH_RUN_IDS: string[] = [];

export function useStudioStitchKnownRunIds(productId: string | undefined) {
  const [stored, setStored] = useState<{
    productId: string;
    ids: string[];
  } | null>(null);
  const ids =
    stored && stored.productId === productId
      ? stored.ids
      : EMPTY_STUDIO_STITCH_RUN_IDS;

  useEffect(() => {
    if (!productId) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const parsed = JSON.parse(
          localStorage.getItem(getStudioStitchRunStorageKey(productId)) ?? "[]",
        );
        setStored({
          productId,
          ids: Array.isArray(parsed)
            ? parsed
                .filter((value): value is string => typeof value === "string")
                .slice(0, 20)
            : [],
        });
      } catch {
        setStored({ productId, ids: [] });
      }
    });
    return () => {
      active = false;
    };
  }, [productId]);

  const remember = useCallback(
    (id: string) => {
      if (!productId) return;
      const next = [id, ...ids.filter((value) => value !== id)].slice(0, 20);
      localStorage.setItem(
        getStudioStitchRunStorageKey(productId),
        JSON.stringify(next),
      );
      setStored({ productId, ids: next });
    },
    [ids, productId],
  );

  return { ids, remember };
}
