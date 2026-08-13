"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useStudioEditorProjectRevisions(
  productId: string,
  projectId: string,
) {
  return useQuery(api.studioEditorProjects.listRevisions.listRevisions, {
    id: projectId,
    limit: 20,
    productId,
  });
}
