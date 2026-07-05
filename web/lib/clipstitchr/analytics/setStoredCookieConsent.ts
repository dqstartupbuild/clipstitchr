import type { CookieConsentPreferences } from "@/lib/clipstitchr/analytics/CookieConsentPreferences";
import { cookieConsentUpdatedEventName } from "@/lib/clipstitchr/analytics/cookieConsentUpdatedEventName";
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

  if (
    typeof window !== "undefined" &&
    typeof window.dispatchEvent === "function"
  ) {
    window.dispatchEvent(new Event(cookieConsentUpdatedEventName));
  }
}
