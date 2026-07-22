import { v } from "convex/values";

export const hookLabCreativeBriefContentValidator = v.object({
  adaptedCaption: v.optional(v.string()),
  adaptedConcept: v.optional(v.string()),
  beatScript: v.array(v.string()),
  callToAction: v.string(),
  closingCta: v.optional(v.string()),
  directionName: v.string(),
  footageNeeds: v.array(v.string()),
  hook: v.string(),
  onScreenTextByScene: v.optional(v.array(v.string())),
  openingReaction: v.optional(v.string()),
  openingVisual: v.string(),
  productProof: v.string(),
  productDemonstration: v.optional(v.string()),
  propsAndInteractions: v.optional(v.array(v.string())),
  sceneBySceneDirections: v.optional(v.array(v.string())),
  soundOffOverlay: v.string(),
  spokenLines: v.optional(v.array(v.string())),
});
