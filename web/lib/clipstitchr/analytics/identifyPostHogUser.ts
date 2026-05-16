import posthog from "posthog-js";
import { getHasAnalyticsConsent } from "@/lib/clipstitchr/analytics/getHasAnalyticsConsent";
import { getIsPostHogConfigured } from "@/lib/clipstitchr/analytics/getIsPostHogConfigured";

type PostHogUserProperties = Record<string, unknown>;

export function identifyPostHogUser(
  userId: string,
  properties?: PostHogUserProperties,
) {
  if (
    typeof window === "undefined" ||
    !getIsPostHogConfigured() ||
    !getHasAnalyticsConsent()
  ) {
    return;
  }

  posthog.identify(userId, properties);
}
