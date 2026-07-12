"use client";

import { useCallback, useState } from "react";
import { retryHookLabIdea } from "@/lib/clipstitchr/client/retryHookLabIdea";
import type { HookLabIdeaActionFeedbackControls } from "@/lib/clipstitchr/types/HookLabIdeaActionFeedbackControls";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

export function useRetryHookLabIdeaAnalysis({
  setError,
  setStatusMessage,
}: HookLabIdeaActionFeedbackControls) {
  const [retryingIdeaId, setRetryingIdeaId] = useState<string | null>(null);
  const retry = useCallback(
    async (id: string) => {
      setRetryingIdeaId(id);
      setError(null);

      try {
        await retryHookLabIdea(id);
        setStatusMessage("Trying that idea again.");
      } catch (nextError) {
        setError(
          getErrorMessage(nextError, "Unable to try that idea again."),
        );
        throw nextError;
      } finally {
        setRetryingIdeaId(null);
      }
    },
    [setError, setStatusMessage],
  );

  return { retry, retryingIdeaId };
}
