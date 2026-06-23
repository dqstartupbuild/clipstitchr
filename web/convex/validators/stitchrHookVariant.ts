import { v } from "convex/values";

export const stitchrHookVariantValidator = v.object({
  angle: v.string(),
  reason: v.string(),
  text: v.string(),
});
