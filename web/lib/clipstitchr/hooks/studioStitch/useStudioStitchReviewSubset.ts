"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useStudioStitchReviewSubset(
  productId: string | undefined,
  reviewSubsetId: string | undefined,
) {
  return useQuery(
    api.studioReelReviewSubsets.get.get,
    productId && reviewSubsetId
      ? { productId, id: reviewSubsetId }
      : "skip",
  );
}
