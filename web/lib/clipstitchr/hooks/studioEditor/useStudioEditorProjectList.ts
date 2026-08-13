"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useStudioEditorProjectList(
  productId: string | undefined,
  includeArchived: boolean,
) {
  return useQuery(
    api.studioEditorProjects.list.list,
    productId
      ? { productId, includeArchived, limit: 60 }
      : "skip",
  );
}
