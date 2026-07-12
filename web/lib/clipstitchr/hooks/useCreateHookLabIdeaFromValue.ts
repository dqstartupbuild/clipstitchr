"use client";

import { useCallback, useState } from "react";
import { createHookLabIdea } from "@/lib/clipstitchr/client/createHookLabIdea";
import type { HookLabIdeaActionFeedbackControls } from "@/lib/clipstitchr/types/HookLabIdeaActionFeedbackControls";
import type { HookLabIdeaScope } from "@/lib/clipstitchr/types/HookLabIdeaScope";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

export function useCreateHookLabIdeaFromValue({
  setError,
  setStatusMessage,
}: HookLabIdeaActionFeedbackControls) {
  const [isCreating, setIsCreating] = useState(false);
  const createFromValue = useCallback(
    async (
      value: string,
      scope: HookLabIdeaScope,
      productId?: string,
    ) => {
      setIsCreating(true);
      setError(null);

      try {
        await createHookLabIdea({ productId, scope, value });
        setStatusMessage(
          "Idea saved. ClipStitchr is finding what makes it useful.",
        );
      } catch (nextError) {
        setError(getErrorMessage(nextError, "Unable to save that idea."));
        throw nextError;
      } finally {
        setIsCreating(false);
      }
    },
    [setError, setStatusMessage],
  );

  return { createFromValue, isCreating };
}
