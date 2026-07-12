"use client";

import { useArchiveHookLabIdea } from "@/lib/clipstitchr/hooks/useArchiveHookLabIdea";
import { useCreateHookLabIdeaFromHookOption } from "@/lib/clipstitchr/hooks/useCreateHookLabIdeaFromHookOption";
import { useCreateHookLabIdeaFromStitchSelection } from "@/lib/clipstitchr/hooks/useCreateHookLabIdeaFromStitchSelection";
import { useCreateHookLabIdeaFromValue } from "@/lib/clipstitchr/hooks/useCreateHookLabIdeaFromValue";
import { useHookLabIdeaActionFeedback } from "@/lib/clipstitchr/hooks/useHookLabIdeaActionFeedback";
import { useRemoveHookLabIdea } from "@/lib/clipstitchr/hooks/useRemoveHookLabIdea";
import { useRetryHookLabIdeaAnalysis } from "@/lib/clipstitchr/hooks/useRetryHookLabIdeaAnalysis";
import { useStartHookLabIdeaUseAction } from "@/lib/clipstitchr/hooks/useStartHookLabIdeaUseAction";
import { useUpdateHookLabIdea } from "@/lib/clipstitchr/hooks/useUpdateHookLabIdea";

export function useHookLabIdeaActions() {
  const feedback = useHookLabIdeaActionFeedback();
  const archiveAction = useArchiveHookLabIdea(feedback);
  const hookOptionAction = useCreateHookLabIdeaFromHookOption(feedback);
  const stitchSelectionAction =
    useCreateHookLabIdeaFromStitchSelection(feedback);
  const valueAction = useCreateHookLabIdeaFromValue(feedback);
  const removeAction = useRemoveHookLabIdea(feedback);
  const retryAction = useRetryHookLabIdeaAnalysis(feedback);
  const useAction = useStartHookLabIdeaUseAction(feedback);
  const updateAction = useUpdateHookLabIdea(feedback);

  return {
    archive: archiveAction.archive,
    archivingIdeaId: archiveAction.archivingIdeaId,
    createFromHookOption: hookOptionAction.createFromHookOption,
    createFromStitch: stitchSelectionAction.createFromStitch,
    createFromValue: valueAction.createFromValue,
    currentUseIdsByIdeaId: useAction.currentUseIdsByIdeaId,
    deletingIdeaId: removeAction.deletingIdeaId,
    error: feedback.error,
    isCreating: stitchSelectionAction.isCreating || valueAction.isCreating,
    remove: removeAction.remove,
    retry: retryAction.retry,
    retryingIdeaId: retryAction.retryingIdeaId,
    savingIdeaId:
      hookOptionAction.savingIdeaId ?? updateAction.savingIdeaId,
    statusMessage: feedback.statusMessage,
    update: updateAction.update,
    useIdea: useAction.useIdea,
    usingIdeaId: useAction.usingIdeaId,
  };
}
