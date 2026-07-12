"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { HookLabIdeaActionFeedbackControls } from "@/lib/clipstitchr/types/HookLabIdeaActionFeedbackControls";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

export function useArchiveHookLabIdea({
  setError,
  setStatusMessage,
}: HookLabIdeaActionFeedbackControls) {
  const archiveMutation = useMutation(api.hookLabIdeas.archive.archive);
  const [archivingIdeaId, setArchivingIdeaId] = useState<string | null>(null);
  const archive = useCallback(
    async (id: string) => {
      setArchivingIdeaId(id);
      setError(null);

      try {
        await archiveMutation({ id, updatedAt: new Date().toISOString() });
        setStatusMessage("Idea archived.");
      } catch (nextError) {
        setError(getErrorMessage(nextError, "Unable to archive that idea."));
        throw nextError;
      } finally {
        setArchivingIdeaId(null);
      }
    },
    [archiveMutation, setError, setStatusMessage],
  );

  return { archive, archivingIdeaId };
}
