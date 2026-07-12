"use client";

import { useCallback, useState } from "react";
import { createHookLabIdea } from "@/lib/clipstitchr/client/createHookLabIdea";
import type { HookLabIdeaActionFeedbackControls } from "@/lib/clipstitchr/types/HookLabIdeaActionFeedbackControls";
import type { HookLabIdeaScope } from "@/lib/clipstitchr/types/HookLabIdeaScope";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

export function useCreateHookLabIdeaFromStitchSelection({
  setError,
  setStatusMessage,
}: HookLabIdeaActionFeedbackControls) {
  const [isCreating, setIsCreating] = useState(false);
  const createFromStitch = useCallback(
    async (
      stitchId: string,
      scope: HookLabIdeaScope,
      productId?: string,
    ) => {
      setIsCreating(true);
      setError(null);

      try {
        await createHookLabIdea({ productId, scope, stitchId });
        setStatusMessage("Stitch saved as an idea.");
      } catch (nextError) {
        setError(
          getErrorMessage(
            nextError,
            "Unable to save that Stitch as an idea.",
          ),
        );
        throw nextError;
      } finally {
        setIsCreating(false);
      }
    },
    [setError, setStatusMessage],
  );

  return { createFromStitch, isCreating };
}
