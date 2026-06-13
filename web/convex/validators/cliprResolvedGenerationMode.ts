import { v } from "convex/values";

export const cliprResolvedGenerationModeValidator = v.union(
  v.literal("script"),
  v.literal("reaction"),
  v.literal("broll"),
  v.literal("demo"),
);
