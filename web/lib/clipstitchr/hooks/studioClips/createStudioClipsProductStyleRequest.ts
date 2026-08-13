import type { StudioClipsCaptionStyle } from "@/lib/clipstitchr/types/studioClips/StudioClipsCaptionStyle";
import type { StudioClipsProductStyleRequest } from "@/lib/clipstitchr/types/studioClips/StudioClipsProductStyleRequest";
import { createStudioClipsIdempotencyKey } from "./createStudioClipsIdempotencyKey";

export function createStudioClipsProductStyleRequest(
  productId: string,
  style: StudioClipsCaptionStyle,
): StudioClipsProductStyleRequest {
  return {
    idempotencyKey: createStudioClipsIdempotencyKey("product_style"),
    productId,
    schemaVersion: "studio-clips-product-style-request-v1",
    style,
  };
}
