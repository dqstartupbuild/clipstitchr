import { v } from "convex/values";
import { swipePublishingBackgroundIdentityValidator } from "./swipePublishingBackgroundIdentity";
import { swipePublishingBundleSlideValidator } from "./swipePublishingBundleSlide";

export const swipePublishingBundleValidator = v.object({
  backgrounds: v.array(swipePublishingBackgroundIdentityValidator),
  createdAt: v.string(),
  editableStateDigest: v.string(),
  rendererVersion: v.string(),
  revision: v.string(),
  slides: v.array(swipePublishingBundleSlideValidator),
});
