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
  trackTikTokEvent("Purchase", {
    content_name: planName,
    content_type: "subscription",
    currency,
    value,
  });
}
