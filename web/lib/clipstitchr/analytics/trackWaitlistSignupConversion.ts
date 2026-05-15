import { trackTikTokEvent } from "@/lib/clipstitchr/analytics/trackTikTokEvent";

export function trackWaitlistSignupConversion() {
  trackTikTokEvent("CompleteRegistration", {
    content_name: "ClipStitchr waitlist",
    content_type: "waitlist",
  });
}
