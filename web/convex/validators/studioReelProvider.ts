import { v } from "convex/values";

export const studioReelProviderValidator = v.union(
  v.literal("dansugc"),
  v.literal("gemini"),
  v.literal("elevenlabs"),
  v.literal("render"),
);
