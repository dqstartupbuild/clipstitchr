import type { StudioClipsCaptionStyle } from "./StudioClipsCaptionStyle";

export type StudioClipsProductStyleRequest = {
  idempotencyKey: string;
  productId: string;
  schemaVersion: "studio-clips-product-style-request-v1";
  style: StudioClipsCaptionStyle;
};
