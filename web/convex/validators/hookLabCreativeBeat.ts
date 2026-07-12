import { v } from "convex/values";

export const hookLabCreativeBeatValidator = v.object({
  beats: v.array(
    v.object({
      approximateEndSeconds: v.optional(v.number()),
      approximateStartSeconds: v.optional(v.number()),
      description: v.string(),
    }),
  ),
  bodyGesture: v.optional(v.string()),
  cameraMovement: v.optional(v.string()),
  emotionalTurn: v.string(),
  facialExpression: v.optional(v.string()),
  framing: v.optional(v.string()),
  genericObjects: v.array(v.string()),
  mustNotCopy: v.array(v.string()),
  openingVisualState: v.string(),
  pacing: v.optional(v.string()),
  payoff: v.string(),
  shotSize: v.optional(v.string()),
  transitionIntoDemo: v.optional(v.string()),
});
