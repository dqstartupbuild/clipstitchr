import { getCookieConsentPreferencesFromCookieHeader } from "@/lib/clipstitchr/server/analytics/getCookieConsentPreferencesFromCookieHeader";

export function getHasAnalyticsConsentFromCookieHeader(
  cookieHeader: string | null,
) {
  return (
    getCookieConsentPreferencesFromCookieHeader(cookieHeader)?.analytics === true
  );
}
