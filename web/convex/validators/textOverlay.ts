import { v } from "convex/values";

export const textOverlayValidator = v.object({
  id: v.optional(v.string()),
  text: v.string(),
  startTime: v.number(),
  endTime: v.number(),
  x: v.number(),
  y: v.number(),
  width: v.number(),
  fontSize: v.number(),
  styleId: v.union(
    v.literal("clean"),
    v.literal("hook"),
    v.literal("caption"),
    v.literal("serif"),
    v.literal("mono"),
    v.literal("badge"),
    v.literal("outline"),
    v.literal("luxe"),
    v.literal("neon"),
    v.literal("soft"),
    v.literal("snapchat"),
  ),
  color: v.optional(v.string()),
  backgroundColor: v.optional(v.string()),
  strokeColor: v.optional(v.string()),
});

export const textOverlaysValidator = v.array(textOverlayValidator);
