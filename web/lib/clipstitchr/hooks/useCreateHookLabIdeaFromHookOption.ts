"use client";

import { useCallback, useState } from "react";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";
import { createHookLabIdea } from "@/lib/clipstitchr/client/createHookLabIdea";
import type { HookLabIdeaActionFeedbackControls } from "@/lib/clipstitchr/types/HookLabIdeaActionFeedbackControls";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

export function useCreateHookLabIdeaFromHookOption({
  setError,
  setStatusMessage,
}: HookLabIdeaActionFeedbackControls) {
  const [savingIdeaId, setSavingIdeaId] = useState<string | null>(null);
  const createFromHookOption = useCallback(
    async (hookOptionId: string, productId?: string) => {
      setSavingIdeaId(hookOptionId);
      setError(null);

      try {
        await createHookLabIdea({
          hookOptionId,
          productId,
          scope: "shared",
        });
        trackPostHogEvent("hook_lab_hook_saved_as_idea", {});
        setStatusMessage("Hook saved as an idea.");
      } catch (nextError) {
        setError(
          getErrorMessage(nextError, "Unable to save that hook as an idea."),
        );
        throw nextError;
      } finally {
        setSavingIdeaId(null);
      }
    },
    [setError, setStatusMessage],
  );

  return { createFromHookOption, savingIdeaId };
}
