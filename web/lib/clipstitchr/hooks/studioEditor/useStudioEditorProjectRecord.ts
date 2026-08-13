"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useStudioEditorProjectRecord(
  productId: string | undefined,
  projectId: string | null,
) {
  return useQuery(
    api.studioEditorProjects.get.get,
    productId && projectId ? { id: projectId, productId } : "skip",
  );
}
