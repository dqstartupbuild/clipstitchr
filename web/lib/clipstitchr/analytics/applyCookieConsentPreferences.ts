import type { CookieConsentPreferences } from "@/lib/clipstitchr/analytics/CookieConsentPreferences";
import { applyPostHogCookieConsent } from "@/lib/clipstitchr/analytics/applyPostHogCookieConsent";
import { deleteFirstPartyAnalyticsCookies } from "@/lib/clipstitchr/analytics/deleteFirstPartyAnalyticsCookies";
import { disableTikTokTracking } from "@/lib/clipstitchr/analytics/disableTikTokTracking";
import { setFirstPartyAnalyticsCookies } from "@/lib/clipstitchr/analytics/setFirstPartyAnalyticsCookies";

export function applyCookieConsentPreferences(
  preferences: CookieConsentPreferences,
) {
  if (preferences.analytics || preferences.marketing) {
    setFirstPartyAnalyticsCookies();
  } else {
    deleteFirstPartyAnalyticsCookies();
  }

  if (!preferences.marketing) {
    disableTikTokTracking();
  }

  applyPostHogCookieConsent(preferences);
}
