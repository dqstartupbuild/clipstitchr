"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { HookLabIdeaActionFeedbackControls } from "@/lib/clipstitchr/types/HookLabIdeaActionFeedbackControls";
import type { HookLabIdeaUpdateInput } from "@/lib/clipstitchr/types/HookLabIdeaUpdateInput";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

export function useUpdateHookLabIdea({
  setError,
  setStatusMessage,
}: HookLabIdeaActionFeedbackControls) {
  const updateMutation = useMutation(api.hookLabIdeas.update.update);
  const [savingIdeaId, setSavingIdeaId] = useState<string | null>(null);
  const update = useCallback(
    async (id: string, input: HookLabIdeaUpdateInput) => {
      setSavingIdeaId(id);
      setError(null);

      try {
        await updateMutation({
          id,
          ...input,
          updatedAt: new Date().toISOString(),
        });
        setStatusMessage("Idea updated.");
      } catch (nextError) {
        setError(getErrorMessage(nextError, "Unable to update that idea."));
        throw nextError;
      } finally {
        setSavingIdeaId(null);
      }
    },
    [setError, setStatusMessage, updateMutation],
  );

  return { savingIdeaId, update };
}
