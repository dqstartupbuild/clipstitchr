import { getStoredCookieConsent } from "@/lib/clipstitchr/analytics/getStoredCookieConsent";

export function getHasMarketingConsent() {
  return getStoredCookieConsent()?.marketing === true;
}
