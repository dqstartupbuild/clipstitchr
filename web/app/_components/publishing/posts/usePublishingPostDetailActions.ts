"use client";

import { useRef, useState } from "react";
import type { PublishingAnalyticsRefreshResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingAnalyticsRefreshResponse";
import type { PublishingPostDetail } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostDetail";
import { cancelPublishingPost } from "@/lib/clipstitchr/publishing/client/requests/cancelPublishingPost";
import { refreshPublishingAnalytics } from "@/lib/clipstitchr/publishing/client/requests/refreshPublishingAnalytics";
import { retryPublishingPost } from "@/lib/clipstitchr/publishing/client/requests/retryPublishingPost";

export function usePublishingPostDetailActions(id: string, productId: string) {
  const [postOverride, setPostOverride] =
    useState<PublishingPostDetail | null>(null);
  const [confirmation, setConfirmation] = useState<"cancel" | "retry" | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [analyticsResult, setAnalyticsResult] =
    useState<PublishingAnalyticsRefreshResponse | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false);
  const actionInFlight = useRef(false);

  return {
    actionError,
    analyticsError,
    analyticsResult,
    confirmation,
    isActing,
    isRefreshingAnalytics,
    postOverride,
    setConfirmation,
    refreshAnalytics: async () => {
      if (actionInFlight.current) {
        return;
      }
      actionInFlight.current = true;
      setIsRefreshingAnalytics(true);
      setAnalyticsError(null);
      try {
        setAnalyticsResult(await refreshPublishingAnalytics(id));
      } catch (error) {
        setAnalyticsError(
          error instanceof Error
            ? error.message
            : "Provider analytics could not refresh.",
        );
      } finally {
        actionInFlight.current = false;
        setIsRefreshingAnalytics(false);
      }
    },
    runAction: async () => {
      if (!confirmation || actionInFlight.current) {
        return;
      }
      actionInFlight.current = true;
      setIsActing(true);
      setActionError(null);
      try {
        const result =
          confirmation === "retry"
            ? await retryPublishingPost(id, productId)
            : await cancelPublishingPost(id, productId);
        setPostOverride(result.post);
        setConfirmation(null);
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "That action did not finish.",
        );
      } finally {
        actionInFlight.current = false;
        setIsActing(false);
      }
    },
  } as const;
}
