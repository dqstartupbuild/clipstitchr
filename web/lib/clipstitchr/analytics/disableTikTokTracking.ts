import { deleteTikTokFirstPartyCookies } from "@/lib/clipstitchr/analytics/deleteTikTokFirstPartyCookies";

export function disableTikTokTracking() {
  if (typeof window === "undefined") {
    return;
  }

  window.ttq?.disableCookie?.();
  window.ttq?.revokeConsent?.();
  deleteTikTokFirstPartyCookies();
}
