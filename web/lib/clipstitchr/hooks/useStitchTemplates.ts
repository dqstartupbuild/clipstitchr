"use client";

import { useCallback, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createStitchTemplateFromConvexDocument } from "@/lib/clipstitchr/backend/createStitchTemplateFromConvexDocument";
import { useCreateStitchTemplate } from "@/lib/clipstitchr/hooks/useCreateStitchTemplate";

export function useStitchTemplates(shouldLoadTemplates = true) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const documents = useQuery(
    api.stitchTemplates.list.list,
    isAuthenticated && shouldLoadTemplates ? { sortOrder: "newest" } : "skip",
  );
  const updateNameMutation = useMutation(
    api.stitchTemplates.updateName.updateName,
  );
  const removeMutation = useMutation(api.stitchTemplates.remove.remove);
  const templateCreator = useCreateStitchTemplate();
  const [error, setError] = useState<string | null>(null);
  const [savingTemplateId, setSavingTemplateId] = useState<string | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(
    null,
  );
  const templates = useMemo(
    () => documents?.map(createStitchTemplateFromConvexDocument) ?? [],
    [documents],
  );
  const renameTemplate = useCallback(
    async (id: string, name: string) => {
      setError(null);
      setSavingTemplateId(id);

      try {
        await updateNameMutation({ id, name });
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Could not rename that template.",
        );
        throw nextError;
      } finally {
        setSavingTemplateId(null);
      }
    },
    [updateNameMutation],
  );
  const deleteTemplate = useCallback(
    async (id: string) => {
      setError(null);
      setDeletingTemplateId(id);

      try {
        await removeMutation({ id });
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Could not delete that template.",
        );
        throw nextError;
      } finally {
        setDeletingTemplateId(null);
      }
    },
    [removeMutation],
  );

  return {
    deletingTemplateId,
    error: error ?? templateCreator.error,
    isLoading:
      isAuthLoading ||
      (isAuthenticated && shouldLoadTemplates && documents === undefined),
    savingStitchId: templateCreator.savingStitchId,
    savingTemplateId,
    templates,
    createTemplateFromStitch: templateCreator.createTemplateFromStitch,
    deleteTemplate,
    renameTemplate,
  };
}
