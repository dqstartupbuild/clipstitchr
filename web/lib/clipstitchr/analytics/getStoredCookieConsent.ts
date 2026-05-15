import type { CookieConsentPreferences } from "@/lib/clipstitchr/analytics/CookieConsentPreferences";
import { cookieConsentCookieName } from "@/lib/clipstitchr/analytics/cookieConsentCookieName";
import { cookieConsentVersion } from "@/lib/clipstitchr/analytics/cookieConsentVersion";
import { getCookieValue } from "@/lib/clipstitchr/analytics/getCookieValue";

function getIsStoredCookieConsent(value: unknown): value is CookieConsentPreferences {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CookieConsentPreferences>;

  return (
    candidate.version === cookieConsentVersion &&
    candidate.necessary === true &&
    typeof candidate.analytics === "boolean" &&
    typeof candidate.marketing === "boolean" &&
    typeof candidate.updatedAt === "string"
  );
}

export function getStoredCookieConsent() {
  const storedValue = getCookieValue(cookieConsentCookieName);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    return getIsStoredCookieConsent(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}
