"use client";

import { useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createHookLabStitchSourceFromConvexDocument } from "@/lib/clipstitchr/backend/createHookLabStitchSourceFromConvexDocument";

export function useHookLabStitchSources(productId?: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const documents = useQuery(
    api.hookLabIdeas.listStitchSources.listStitchSources,
    isAuthenticated ? { ...(productId ? { productId } : {}) } : "skip",
  );
  const stitches = useMemo(
    () => documents?.map(createHookLabStitchSourceFromConvexDocument) ?? [],
    [documents],
  );

  return {
    isLoading: isAuthLoading || (isAuthenticated && documents === undefined),
    stitches,
  };
}
