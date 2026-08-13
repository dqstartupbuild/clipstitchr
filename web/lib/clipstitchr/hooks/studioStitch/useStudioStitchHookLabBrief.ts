"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useStudioStitchHookLabBrief(
  productId: string | undefined,
  sourcePostId: string,
) {
  const result = useQuery(
    api.hookLabCreativeBriefs.getLatestForSourcePost.getLatestForSourcePost,
    sourcePostId ? { sourcePostId } : "skip",
  );
  if (result === undefined) return undefined;
  if (!result || result.brief.productId !== productId) return null;
  if (
    result.brief.destinationTool !== "stitchr" ||
    !["approved", "used"].includes(result.brief.status)
  ) {
    return null;
  }

  return result.brief;
}
