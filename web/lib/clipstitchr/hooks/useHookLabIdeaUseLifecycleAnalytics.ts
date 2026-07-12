"use client";

import { useEffect, useRef } from "react";
import { createHookLabIdeaUseLifecycleAnalyticsProperties } from "@/lib/clipstitchr/analytics/createHookLabIdeaUseLifecycleAnalyticsProperties";
import { getHookLabIdeaUseLifecycleEvent } from "@/lib/clipstitchr/analytics/getHookLabIdeaUseLifecycleEvent";
import { trackHookLabLifecycleEvent } from "@/lib/clipstitchr/analytics/trackHookLabLifecycleEvent";
import type { HookLabIdeaUseProgress } from "@/lib/clipstitchr/types/HookLabIdeaUseProgress";
import type { HookLabIdeaUseStatus } from "@/lib/clipstitchr/types/HookLabIdeaUseStatus";

export function useHookLabIdeaUseLifecycleAnalytics(
  progress: HookLabIdeaUseProgress | null,
) {
  const previousProgress = useRef<{
    id: string;
    status: HookLabIdeaUseStatus;
  } | null>(null);

  useEffect(() => {
    if (!progress) {
      return;
    }

    const priorStatus =
      previousProgress.current?.id === progress.id
        ? previousProgress.current.status
        : null;

    previousProgress.current = {
      id: progress.id,
      status: progress.status,
    };

    if (priorStatus === progress.status) {
      return;
    }

    const eventName = getHookLabIdeaUseLifecycleEvent(progress.status);

    if (!eventName) {
      return;
    }

    trackHookLabLifecycleEvent({
      eventName,
      lifecycleKey: progress.id,
      properties: createHookLabIdeaUseLifecycleAnalyticsProperties(progress),
    });
  }, [progress]);
}
