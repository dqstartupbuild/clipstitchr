"use client";

import { useMemo } from "react";
import { useConvexAuth, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createHookLabPostFromConvexDocument } from "@/lib/clipstitchr/backend/createHookLabPostFromConvexDocument";

export function useHookLabPosts() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const query = usePaginatedQuery(
    api.hookLabPosts.list.list,
    isAuthenticated ? {} : "skip",
    { initialNumItems: 12 },
  );
  const posts = useMemo(
    () => query.results.map(createHookLabPostFromConvexDocument),
    [query.results],
  );

  return {
    canLoadMore: query.status === "CanLoadMore",
    isLoading: isAuthLoading || query.status === "LoadingFirstPage",
    isLoadingMore: query.status === "LoadingMore",
    loadMore: () => query.loadMore(12),
    posts,
  };
}
