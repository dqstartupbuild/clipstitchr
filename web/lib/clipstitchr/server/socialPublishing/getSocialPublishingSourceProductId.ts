import type { SocialPublishingSourceType } from "@/lib/clipstitchr/types/SocialPublishingSourceType";

type SocialPublishingSourceDocument = {
  productId?: string;
  productSourceId?: string;
};

export function getSocialPublishingSourceProductId(
  sourceType: SocialPublishingSourceType,
  source: SocialPublishingSourceDocument,
) {
  return sourceType === "stitch" ? source.productId : source.productSourceId;
}
