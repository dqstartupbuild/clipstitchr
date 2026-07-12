import { claimHookLabLifecycleEvent } from "@/lib/clipstitchr/analytics/claimHookLabLifecycleEvent";
import { getHasAnalyticsConsent } from "@/lib/clipstitchr/analytics/getHasAnalyticsConsent";
import { getIsPostHogConfigured } from "@/lib/clipstitchr/analytics/getIsPostHogConfigured";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";
import type { HookLabLifecycleEventName } from "@/lib/clipstitchr/types/HookLabLifecycleEventName";

export function trackHookLabLifecycleEvent({
  eventName,
  lifecycleKey,
  properties,
}: {
  eventName: HookLabLifecycleEventName;
  lifecycleKey: string;
  properties: Record<string, boolean | number | string | undefined>;
}) {
  if (!getIsPostHogConfigured() || !getHasAnalyticsConsent()) {
    return;
  }

  if (!claimHookLabLifecycleEvent(eventName, lifecycleKey)) {
    return;
  }

  trackPostHogEvent(eventName, properties);
}
