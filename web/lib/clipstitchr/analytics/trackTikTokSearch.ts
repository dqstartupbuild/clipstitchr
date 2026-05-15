import { createTikTokEventPayload } from "@/lib/clipstitchr/analytics/createTikTokEventPayload";
import { trackTikTokEvent } from "@/lib/clipstitchr/analytics/trackTikTokEvent";

type TrackTikTokSearchOptions = {
  contentCategory: string;
  contentId: string;
  contentName: string;
  searchString: string;
};

export function trackTikTokSearch({
  contentCategory,
  contentId,
  contentName,
  searchString,
}: TrackTikTokSearchOptions) {
  const trimmedSearchString = searchString.trim();

  if (!trimmedSearchString) {
    return;
  }

  trackTikTokEvent("Search", {
    ...createTikTokEventPayload({
      contentCategory,
      contentId,
      contentName,
      contentType: "product_group",
    }),
    search_string: trimmedSearchString.slice(0, 120),
  });
}
