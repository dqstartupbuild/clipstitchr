"use client";

import { useCallback, useState } from "react";
import { startHookLabIdeaUse } from "@/lib/clipstitchr/client/startHookLabIdeaUse";
import type { HookLabIdeaActionFeedbackControls } from "@/lib/clipstitchr/types/HookLabIdeaActionFeedbackControls";
import type { HookLabCurrentUseIdsByIdeaId } from "@/lib/clipstitchr/types/HookLabCurrentUseIdsByIdeaId";
import type { HookLabIdeaVariationCount } from "@/lib/clipstitchr/types/HookLabIdeaVariationCount";
import type { HookLabResolvedDefaults } from "@/lib/clipstitchr/types/HookLabResolvedDefaults";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

export function useStartHookLabIdeaUseAction({
  setError,
  setStatusMessage,
}: HookLabIdeaActionFeedbackControls) {
  const [usingIdeaId, setUsingIdeaId] = useState<string | null>(null);
  const [currentUseIdsByIdeaId, setCurrentUseIdsByIdeaId] =
    useState<HookLabCurrentUseIdsByIdeaId>({});
  const useIdea = useCallback(
    async (
      id: string,
      productId: string,
      variationCount: HookLabIdeaVariationCount,
      defaults?: HookLabResolvedDefaults,
    ) => {
      setUsingIdeaId(id);
      setError(null);

      try {
        const result = await startHookLabIdeaUse(id, {
          productId,
          variationCount,
          ...(defaults
            ? {
                defaultAvatarId: defaults.defaultAvatarId,
                defaultDemoClipId: defaults.defaultDemoClipId,
                saveDefaults: defaults.saveDefaults,
              }
            : {}),
        });
        setCurrentUseIdsByIdeaId((currentUseIds) => ({
          ...currentUseIds,
          [id]: result.useId,
        }));
        setStatusMessage(
          result.message ??
            `${variationCount === 1 ? "Your Stitch is" : "Your Stitches are"} being created.`,
        );
        return result;
      } catch (nextError) {
        setError(
          getErrorMessage(nextError, "Unable to use that idea right now."),
        );
        throw nextError;
      } finally {
        setUsingIdeaId(null);
      }
    },
    [setError, setStatusMessage],
  );

  return { currentUseIdsByIdeaId, useIdea, usingIdeaId };
}
