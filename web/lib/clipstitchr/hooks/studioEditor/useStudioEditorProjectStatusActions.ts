"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createId } from "@/lib/clipstitchr/utils/createId";
import type { StudioEditorProjectSummary } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectSummary";

export function useStudioEditorProjectStatusActions(productId: string | undefined) {
  const archiveMutation = useMutation(api.studioEditorProjects.archive.archive);
  const reopenMutation = useMutation(api.studioEditorProjects.reopen.reopen);
  const [busyProjectId, setBusyProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const archive = useCallback(
    async (project: StudioEditorProjectSummary) => {
      if (!productId) return;
      setBusyProjectId(project.id);
      setError(null);
      try {
        await archiveMutation({
          id: project.id,
          productId,
          expectedRevision: project.revision,
          idempotencyKey: `archive-${project.id}-${createId()}`,
        });
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Unable to archive this edit.",
        );
      } finally {
        setBusyProjectId(null);
      }
    },
    [archiveMutation, productId],
  );

  const reopen = useCallback(
    async (project: StudioEditorProjectSummary) => {
      if (!productId) return;
      setBusyProjectId(project.id);
      setError(null);
      try {
        await reopenMutation({
          id: project.id,
          productId,
          expectedRevision: project.revision,
          idempotencyKey: `reopen-${project.id}-${createId()}`,
        });
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Unable to reopen this edit.",
        );
      } finally {
        setBusyProjectId(null);
      }
    },
    [productId, reopenMutation],
  );

  return { archive, busyProjectId, error, reopen };
}
