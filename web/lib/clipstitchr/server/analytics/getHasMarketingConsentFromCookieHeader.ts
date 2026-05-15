import type { CookieConsentPreferences } from "@/lib/clipstitchr/analytics/CookieConsentPreferences";
import { cookieConsentCookieName } from "@/lib/clipstitchr/analytics/cookieConsentCookieName";
import { cookieConsentVersion } from "@/lib/clipstitchr/analytics/cookieConsentVersion";
import { getServerCookieValue } from "@/lib/clipstitchr/server/analytics/getServerCookieValue";

function getIsCookieConsentPreferences(
  value: unknown,
): value is CookieConsentPreferences {
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

export function getHasMarketingConsentFromCookieHeader(
  cookieHeader: string | null,
) {
  const storedValue = getServerCookieValue(cookieHeader, cookieConsentCookieName);

  if (!storedValue) {
    return false;
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    return (
      getIsCookieConsentPreferences(parsedValue) && parsedValue.marketing
    );
  } catch {
    return false;
  }
}
