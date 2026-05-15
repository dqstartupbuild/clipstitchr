import { createTikTokEventPayload } from "@/lib/clipstitchr/analytics/createTikTokEventPayload";
import { trackTikTokEvent } from "@/lib/clipstitchr/analytics/trackTikTokEvent";

type TrackTikTokButtonClickOptions = {
  contentCategory: string;
  contentId: string;
  contentName: string;
};

export function trackTikTokButtonClick({
  contentCategory,
  contentId,
  contentName,
}: TrackTikTokButtonClickOptions) {
  trackTikTokEvent(
    "ClickButton",
    createTikTokEventPayload({
      contentCategory,
      contentId,
      contentName,
      contentType: "product_group",
    }),
  );
}
