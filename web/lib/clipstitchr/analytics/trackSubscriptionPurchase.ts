import { createTikTokEventPayload } from "@/lib/clipstitchr/analytics/createTikTokEventPayload";
import { trackTikTokEvent } from "@/lib/clipstitchr/analytics/trackTikTokEvent";

type TrackSubscriptionPurchaseOptions = {
  currency: string;
  value: number;
  planName?: string;
};

export function trackSubscriptionPurchase({
  currency,
  value,
  planName,
}: TrackSubscriptionPurchaseOptions) {
  trackTikTokEvent(
    "Purchase",
    createTikTokEventPayload({
      contentCategory: "Subscription",
      contentId: "subscription_purchase",
      contentName: planName ?? "ClipStitchr subscription",
      contentType: "product",
      currency,
      value,
    }),
  );
}
