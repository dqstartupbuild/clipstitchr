"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createHookLabIdeaUseProgressFromConvexDocument } from "@/lib/clipstitchr/backend/createHookLabIdeaUseProgressFromConvexDocument";

export function useHookLabIdeaUse(useId?: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const document = useQuery(
    api.hookLabIdeaUses.get.get,
    isAuthenticated && useId ? { id: useId } : "skip",
  );

  return {
    isLoading:
      isAuthLoading ||
      (isAuthenticated && Boolean(useId) && document === undefined),
    progress: document
      ? createHookLabIdeaUseProgressFromConvexDocument(document)
      : null,
  };
}
