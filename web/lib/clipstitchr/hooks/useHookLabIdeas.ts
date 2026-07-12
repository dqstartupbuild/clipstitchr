"use client";

import { useMemo } from "react";
import { useConvexAuth, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createHookLabIdeaFromConvexDocument } from "@/lib/clipstitchr/backend/createHookLabIdeaFromConvexDocument";
import type { HookLabIdeaScopeFilter } from "@/lib/clipstitchr/types/HookLabIdeaScopeFilter";
import type { HookLabIdeaStatusFilter } from "@/lib/clipstitchr/types/HookLabIdeaStatusFilter";

type UseHookLabIdeasOptions = {
  productId?: string;
  scopeFilter: HookLabIdeaScopeFilter;
  searchQuery: string;
  statusFilter: HookLabIdeaStatusFilter;
};

export function useHookLabIdeas({
  productId,
  scopeFilter,
  searchQuery,
  statusFilter,
}: UseHookLabIdeasOptions) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const query = usePaginatedQuery(
    api.hookLabIdeas.list.list,
    isAuthenticated
      ? {
          ...(productId ? { productId } : {}),
          scopeFilter,
          ...(searchQuery.trim() ? { searchQuery: searchQuery.trim() } : {}),
          statusFilter,
        }
      : "skip",
    { initialNumItems: 12 },
  );
  const ideas = useMemo(
    () => query.results.map(createHookLabIdeaFromConvexDocument),
    [query.results],
  );

  return {
    canLoadMore: query.status === "CanLoadMore",
    ideas,
    isLoading: isAuthLoading || query.status === "LoadingFirstPage",
    isLoadingMore: query.status === "LoadingMore",
    loadMore: () => query.loadMore(12),
  };
}
