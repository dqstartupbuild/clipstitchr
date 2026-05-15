import { getStoredCookieConsent } from "@/lib/clipstitchr/analytics/getStoredCookieConsent";

export function getHasAnalyticsConsent() {
  return getStoredCookieConsent()?.analytics === true;
}
