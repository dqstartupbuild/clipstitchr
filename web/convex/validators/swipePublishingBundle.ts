import { v } from "convex/values";
import { swipePublishingBundleSlideValidator } from "./swipePublishingBundleSlide";
import { swipePublishingBackgroundIdentityValidator } from "./swipePublishingBackgroundIdentity";

export const swipePublishingBundleValidator = v.object({
  backgrounds: v.array(swipePublishingBackgroundIdentityValidator),
  createdAt: v.string(),
  editableStateDigest: v.string(),
  rendererVersion: v.string(),
  revision: v.string(),
  slides: v.array(swipePublishingBundleSlideValidator),
});
