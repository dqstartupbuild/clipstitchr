import { v } from "convex/values";

export const automationStitchrTextStyleChoiceValidator = v.union(
  v.literal("any"),
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
);
