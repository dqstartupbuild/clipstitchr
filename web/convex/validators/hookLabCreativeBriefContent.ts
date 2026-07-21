import { v } from "convex/values";

export const hookLabCreativeBriefContentValidator = v.object({
  beatScript: v.array(v.string()),
  callToAction: v.string(),
  directionName: v.string(),
  footageNeeds: v.array(v.string()),
  hook: v.string(),
  openingVisual: v.string(),
  productProof: v.string(),
  soundOffOverlay: v.string(),
});
