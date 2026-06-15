"use client";

import { useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createStitchTemplateFromConvexDocument } from "@/lib/clipstitchr/backend/createStitchTemplateFromConvexDocument";
import { useStitchTemplateActions } from "@/lib/clipstitchr/hooks/useStitchTemplateActions";

export function useStitchTemplates() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const actions = useStitchTemplateActions();
  const documents = useQuery(
    api.stitchTemplates.list.list,
    isAuthenticated ? { sortOrder: "newest" } : "skip",
  );
  const templates = useMemo(
    () => documents?.map(createStitchTemplateFromConvexDocument) ?? [],
    [documents],
  );

  return {
    deletingTemplateId: actions.deletingTemplateId,
    error: actions.error,
    isLoading: isAuthLoading || (isAuthenticated && documents === undefined),
    savingStitchId: actions.savingStitchId,
    savingTemplateId: actions.savingTemplateId,
    templates,
    createTemplateFromStitch: actions.createTemplateFromStitch,
    deleteTemplate: actions.deleteTemplate,
    renameTemplate: actions.renameTemplate,
  };
}
