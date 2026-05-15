import { createTikTokEventPayload } from "@/lib/clipstitchr/analytics/createTikTokEventPayload";
import { identifyTikTokUser } from "@/lib/clipstitchr/analytics/identifyTikTokUser";
import { trackTikTokEvent } from "@/lib/clipstitchr/analytics/trackTikTokEvent";

type TrackWaitlistSignupConversionOptions = {
  email?: string;
};

export async function trackWaitlistSignupConversion({
  email,
}: TrackWaitlistSignupConversionOptions = {}) {
  await identifyTikTokUser({
    email,
  });

  trackTikTokEvent(
    "Lead",
    createTikTokEventPayload({
      contentCategory: "Waitlist",
      contentId: "waitlist_signup",
      contentName: "ClipStitchr waitlist",
      contentType: "product_group",
    }),
  );
}
