import type { SwipePublishingBundleSlide } from "@/lib/clipstitchr/publishing/media/SwipePublishingBundleSlide";
import type { SwipePublishingBackgroundIdentity } from "@/lib/clipstitchr/publishing/media/SwipePublishingBackgroundIdentity";

export type SwipePublishingBundle = {
  backgrounds: SwipePublishingBackgroundIdentity[];
  createdAt: string;
  editableStateDigest: string;
  rendererVersion: string;
  revision: string;
  slides: SwipePublishingBundleSlide[];
};
