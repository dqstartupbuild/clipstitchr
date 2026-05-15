import type { TikTokContentType } from "@/lib/clipstitchr/analytics/TikTokContentType";
import type { TikTokEventPayload } from "@/lib/clipstitchr/analytics/TikTokEventPayload";

type CreateTikTokEventPayloadOptions = {
  contentId: string;
  contentName: string;
  contentCategory: string;
  contentType?: TikTokContentType;
  currency?: string;
  value?: number;
};

export function createTikTokEventPayload({
  contentId,
  contentName,
  contentCategory,
  contentType = "product",
  currency = "USD",
  value = 0,
}: CreateTikTokEventPayloadOptions): TikTokEventPayload {
  return {
    contents: [
      {
        brand: "ClipStitchr",
        content_category: contentCategory,
        content_id: contentId,
        content_name: contentName,
        content_type: contentType,
      },
    ],
    currency,
    value,
  };
}
