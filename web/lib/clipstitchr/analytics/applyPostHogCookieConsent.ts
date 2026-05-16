import posthog from "posthog-js";
import type { CookieConsentPreferences } from "@/lib/clipstitchr/analytics/CookieConsentPreferences";
import { getIsPostHogConfigured } from "@/lib/clipstitchr/analytics/getIsPostHogConfigured";
import { resetPostHogUser } from "@/lib/clipstitchr/analytics/resetPostHogUser";

export function applyPostHogCookieConsent(
  preferences: CookieConsentPreferences,
) {
  if (typeof window === "undefined" || !getIsPostHogConfigured()) {
    return;
  }

  if (preferences.analytics) {
    posthog.opt_in_capturing({ captureEventName: false });
    return;
  }

  posthog.opt_out_capturing();
  resetPostHogUser();
}
