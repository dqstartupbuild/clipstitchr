import type { PostBridgeSourceType } from "@/lib/clipstitchr/types/PostBridgeSourceType";

type PostBridgeSourceDocument = {
  productId?: string;
  productSourceId?: string;
};

export function getPostBridgeSourceProductId(
  sourceType: PostBridgeSourceType,
  source: PostBridgeSourceDocument,
) {
  return sourceType === "stitch" ? source.productId : source.productSourceId;
}
