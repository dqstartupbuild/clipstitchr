"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useStudioStitchOutputs(
  productId: string | undefined,
  generationRunId: string | undefined,
) {
  return useQuery(
    api.studioReelOutputs.list.list,
    productId && generationRunId
      ? { productId, generationRunId, limit: 100 }
      : "skip",
  );
}
