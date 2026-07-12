"use client";

import { useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createHookLabIdeaDefaultsFromConvexDocument } from "@/lib/clipstitchr/backend/createHookLabIdeaDefaultsFromConvexDocument";

export function useHookLabDefaults(productId?: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const document = useQuery(
    api.hookLabDefaults.get.get,
    isAuthenticated && productId ? { productId } : "skip",
  );
  const defaults = useMemo(
    () =>
      document
        ? createHookLabIdeaDefaultsFromConvexDocument(document)
        : undefined,
    [document],
  );

  return {
    defaults,
    isLoading:
      isAuthLoading ||
      (isAuthenticated && Boolean(productId) && document === undefined),
  };
}
