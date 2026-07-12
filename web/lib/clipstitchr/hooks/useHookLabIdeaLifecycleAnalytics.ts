"use client";

import { useEffect, useRef } from "react";
import { createHookLabIdeaLifecycleAnalyticsProperties } from "@/lib/clipstitchr/analytics/createHookLabIdeaLifecycleAnalyticsProperties";
import { getHookLabIdeaAnalysisLifecycleEvent } from "@/lib/clipstitchr/analytics/getHookLabIdeaAnalysisLifecycleEvent";
import { trackHookLabLifecycleEvent } from "@/lib/clipstitchr/analytics/trackHookLabLifecycleEvent";
import type { HookLabIdea } from "@/lib/clipstitchr/types/HookLabIdea";
import type { HookLabIdeaStatus } from "@/lib/clipstitchr/types/HookLabIdeaStatus";

export function useHookLabIdeaLifecycleAnalytics(ideas: HookLabIdea[]) {
  const previousStatuses = useRef(new Map<string, HookLabIdeaStatus>());

  useEffect(() => {
    for (const idea of ideas) {
      const previousStatus = previousStatuses.current.get(idea.id);

      previousStatuses.current.set(idea.id, idea.status);

      if (!previousStatus) {
        continue;
      }

      const eventName = getHookLabIdeaAnalysisLifecycleEvent(
        previousStatus,
        idea.status,
      );

      if (!eventName) {
        continue;
      }

      trackHookLabLifecycleEvent({
        eventName,
        lifecycleKey: `${idea.id}:${idea.updatedAt}`,
        properties: createHookLabIdeaLifecycleAnalyticsProperties(idea),
      });
    }
  }, [ideas]);
}
