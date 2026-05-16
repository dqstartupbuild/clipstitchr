import posthog from "posthog-js";
import { getHasAnalyticsConsent } from "@/lib/clipstitchr/analytics/getHasAnalyticsConsent";
import { getIsPostHogConfigured } from "@/lib/clipstitchr/analytics/getIsPostHogConfigured";

type PostHogExceptionProperties = Record<string, unknown>;

export function capturePostHogException(
  error: unknown,
  properties?: PostHogExceptionProperties,
) {
  if (
    typeof window === "undefined" ||
    !getIsPostHogConfigured() ||
    !getHasAnalyticsConsent()
  ) {
    return;
  }

  posthog.captureException(error, properties);
}
