import { v } from "convex/values";

export const cliprGenerationModeValidator = v.union(
  v.literal("any"),
  v.literal("script"),
  v.literal("reaction"),
  v.literal("broll"),
);
