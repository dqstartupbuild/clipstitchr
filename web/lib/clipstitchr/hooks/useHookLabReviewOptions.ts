"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useConvexAuth,
  useMutation,
  usePaginatedQuery,
} from "convex/react";
import { api } from "@/convex/_generated/api";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";
import { createHookLabReviewOptionFromConvexDocument } from "@/lib/clipstitchr/backend/createHookLabReviewOptionFromConvexDocument";
import type { HookLabReviewState } from "@/lib/clipstitchr/types/HookLabReviewState";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

type UseHookLabReviewOptions = {
  productId?: string;
  reviewState: HookLabReviewState;
};

export function useHookLabReviewOptions({
  productId,
  reviewState,
}: UseHookLabReviewOptions) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const query = usePaginatedQuery(
    api.stitchrHookOptions.listReview.listReview,
    isAuthenticated
      ? { ...(productId ? { productId } : {}), reviewState }
      : "skip",
    { initialNumItems: 12 },
  );
  const selectMutation = useMutation(
    api.stitchrHookOptions.select.select,
  );
  const markNotForMeMutation = useMutation(
    api.stitchrHookOptions.markNotForMe.markNotForMe,
  );
  const undoFeedbackMutation = useMutation(
    api.stitchrHookOptions.undoFeedback.undoFeedback,
  );
  const [savingOptionId, setSavingOptionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const options = useMemo(
    () => query.results.map(createHookLabReviewOptionFromConvexDocument),
    [query.results],
  );
  const select = useCallback(
    async (id: string) => {
      setSavingOptionId(id);
      setError(null);

      try {
        await selectMutation({ id, updatedAt: new Date().toISOString() });
        trackPostHogEvent("hook_lab_hook_used", {});
        setStatusMessage("That hook is now active on its Stitch.");
      } catch (nextError) {
        setError(getErrorMessage(nextError, "Unable to use that hook."));
        throw nextError;
      } finally {
        setSavingOptionId(null);
      }
    },
    [selectMutation],
  );
  const markNotForMe = useCallback(
    async (id: string) => {
      setSavingOptionId(id);
      setError(null);

      try {
        await markNotForMeMutation({ id, updatedAt: new Date().toISOString() });
        trackPostHogEvent("hook_lab_hook_marked_not_for_me", {});
        setStatusMessage("That hook was added to the avoid list.");
      } catch (nextError) {
        setError(getErrorMessage(nextError, "Unable to update that hook."));
        throw nextError;
      } finally {
        setSavingOptionId(null);
      }
    },
    [markNotForMeMutation],
  );
  const undo = useCallback(
    async (id: string) => {
      setSavingOptionId(id);
      setError(null);

      try {
        await undoFeedbackMutation({ id, updatedAt: new Date().toISOString() });
        setStatusMessage("Hook moved back to Needs review.");
      } catch (nextError) {
        setError(getErrorMessage(nextError, "Unable to undo that choice."));
        throw nextError;
      } finally {
        setSavingOptionId(null);
      }
    },
    [undoFeedbackMutation],
  );

  return {
    canLoadMore: query.status === "CanLoadMore",
    error,
    isLoading: isAuthLoading || query.status === "LoadingFirstPage",
    isLoadingMore: query.status === "LoadingMore",
    loadMore: () => query.loadMore(12),
    markNotForMe,
    options,
    savingOptionId,
    select,
    statusMessage,
    undo,
  };
}
