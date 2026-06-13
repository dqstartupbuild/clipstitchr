"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createStitchTemplateFromConvexDocument } from "@/lib/clipstitchr/backend/createStitchTemplateFromConvexDocument";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getStitchTemplateDefaultName } from "@/lib/clipstitchr/utils/getStitchTemplateDefaultName";

export function useStitchTemplates() {
  const documents = useQuery(api.stitchTemplates.list.list, {
    sortOrder: "newest",
  });
  const createFromStitchMutation = useMutation(
    api.stitchTemplates.createFromStitch.createFromStitch,
  );
  const updateNameMutation = useMutation(
    api.stitchTemplates.updateName.updateName,
  );
  const removeMutation = useMutation(api.stitchTemplates.remove.remove);
  const [error, setError] = useState<string | null>(null);
  const [savingStitchId, setSavingStitchId] = useState<string | null>(null);
  const [savingTemplateId, setSavingTemplateId] = useState<string | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(
    null,
  );
  const templates = useMemo(
    () => documents?.map(createStitchTemplateFromConvexDocument) ?? [],
    [documents],
  );
  const createTemplateFromStitch = useCallback(
    async (stitch: Stitch) => {
      const templateId = createId();

      setError(null);
      setSavingStitchId(stitch.id);

      try {
        await createFromStitchMutation({
          id: templateId,
          name: getStitchTemplateDefaultName(stitch),
          stitchId: stitch.id,
        });
        return templateId;
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Could not save that template.",
        );
        throw nextError;
      } finally {
        setSavingStitchId(null);
      }
    },
    [createFromStitchMutation],
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
    error,
    isLoading: documents === undefined,
    savingStitchId,
    savingTemplateId,
    templates,
    createTemplateFromStitch,
    deleteTemplate,
    renameTemplate,
  };
}
