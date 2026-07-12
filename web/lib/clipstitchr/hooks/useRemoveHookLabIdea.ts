"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import type { HookLabIdeaActionFeedbackControls } from "@/lib/clipstitchr/types/HookLabIdeaActionFeedbackControls";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

export function useRemoveHookLabIdea({
  setError,
  setStatusMessage,
}: HookLabIdeaActionFeedbackControls) {
  const removeMutation = useMutation(api.hookLabIdeas.remove.remove);
  const [deletingIdeaId, setDeletingIdeaId] = useState<string | null>(null);
  const remove = useCallback(
    async (id: string) => {
      setDeletingIdeaId(id);
      setError(null);

      try {
        const removedIdea = await removeMutation({ id });

        if (removedIdea?.thumbnailObject?.key.includes("/hook-lab/")) {
          await deleteObjectsFromR2([removedIdea.thumbnailObject]).catch(
            () => undefined,
          );
        }
        setStatusMessage("Idea deleted.");
      } catch (nextError) {
        setError(getErrorMessage(nextError, "Unable to delete that idea."));
        throw nextError;
      } finally {
        setDeletingIdeaId(null);
      }
    },
    [removeMutation, setError, setStatusMessage],
  );

  return { deletingIdeaId, remove };
}
