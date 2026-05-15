import type { CookieConsentPreferences } from "@/lib/clipstitchr/analytics/CookieConsentPreferences";
import { consentCookieMaxAgeSeconds } from "@/lib/clipstitchr/analytics/cookieMaxAgeSeconds";
import { cookieConsentCookieName } from "@/lib/clipstitchr/analytics/cookieConsentCookieName";
import { setCookieValue } from "@/lib/clipstitchr/analytics/setCookieValue";

export function setStoredCookieConsent(
  preferences: CookieConsentPreferences,
) {
  setCookieValue(
    cookieConsentCookieName,
    JSON.stringify(preferences),
    consentCookieMaxAgeSeconds,
  );
}
