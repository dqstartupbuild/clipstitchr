import { getHasMarketingConsent } from "@/lib/clipstitchr/analytics/getHasMarketingConsent";

export function trackTikTokPageView() {
  if (typeof window === "undefined" || !getHasMarketingConsent()) {
    return;
  }

  window.ttq?.page?.();
}
