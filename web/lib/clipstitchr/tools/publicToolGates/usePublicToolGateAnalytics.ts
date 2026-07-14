"use client";

import { useEffect, useRef } from "react";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import { trackPublicToolAnalyticsEvent } from "@/lib/clipstitchr/tools/publicToolGates/trackPublicToolAnalyticsEvent";

export function usePublicToolGateAnalytics({
  isEnabled,
  isGateDisplayed,
  isResourceUnlocked,
  isResultDisplayed,
  toolKey,
  variant,
}: {
  isEnabled: boolean;
  isGateDisplayed: boolean;
  isResourceUnlocked: boolean;
  isResultDisplayed: boolean;
  toolKey: PublicToolKey;
  variant: PublicToolGateVariant;
}) {
  const hasTrackedResult = useRef(false);
  const hasTrackedGate = useRef(false);
  const hasTrackedUnlock = useRef(false);

  useEffect(() => {
    if (!isEnabled) return;

    const gateMode = getPublicToolGateMetadata(toolKey).mode;
    const context = { gateMode, toolKey, variant };

    if (isResultDisplayed && !hasTrackedResult.current) {
      hasTrackedResult.current = true;
      trackPublicToolAnalyticsEvent("tool_result_displayed", context);
    }

    if (isGateDisplayed && !hasTrackedGate.current) {
      hasTrackedGate.current = true;
      trackPublicToolAnalyticsEvent("tool_gate_displayed", context);
    }

    if (isResourceUnlocked && !hasTrackedUnlock.current) {
      hasTrackedUnlock.current = true;
      trackPublicToolAnalyticsEvent("tool_resource_unlocked", context);
    }
  }, [
    isEnabled,
    isGateDisplayed,
    isResourceUnlocked,
    isResultDisplayed,
    toolKey,
    variant,
  ]);
}
