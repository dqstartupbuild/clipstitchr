"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { HookLabDestinationTool } from "@/lib/clipstitchr/types/HookLabDestinationTool";

export function useHookLabCreativeBrief(
  id: string | null,
  destinationTool?: HookLabDestinationTool,
) {
  const { isAuthenticated } = useConvexAuth();
  const document = useQuery(
    api.hookLabCreativeBriefs.get.get,
    isAuthenticated && id ? { id } : "skip",
  );
  const markUsedMutation = useMutation(
    api.hookLabCreativeBriefs.markUsed.markUsed,
  );

  return {
    brief:
      document && (!destinationTool || document.destinationTool === destinationTool)
        ? document
        : null,
    isLoading: Boolean(isAuthenticated && id && document === undefined),
    markUsed: async () => {
      if (!id || !destinationTool) {
        return;
      }

      await markUsedMutation({ destinationTool, id });
    },
  };
}
