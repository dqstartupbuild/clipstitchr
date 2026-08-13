import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export type SwipePublishingBundleSlide = {
  checksumSha256: string;
  etag?: string;
  height: number;
  index: number;
  object: R2ObjectReference;
  versionId?: string;
  width: number;
};
