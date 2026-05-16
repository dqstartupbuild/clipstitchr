import posthog from "posthog-js";
import { getHasAnalyticsConsent } from "@/lib/clipstitchr/analytics/getHasAnalyticsConsent";
import { getIsPostHogConfigured } from "@/lib/clipstitchr/analytics/getIsPostHogConfigured";

type PostHogEventProperties = Record<string, unknown>;

export function trackPostHogEvent(
  eventName: string,
  properties?: PostHogEventProperties,
) {
  if (
    typeof window === "undefined" ||
    !getIsPostHogConfigured() ||
    !getHasAnalyticsConsent()
  ) {
    return;
  }

  posthog.capture(eventName, properties);
}
