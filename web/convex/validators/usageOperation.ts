import { v } from "convex/values";

export const usageOperationValidator = v.union(
  v.literal("stitch"),
  v.literal("swipr"),
  v.literal("avatar_photo"),
  v.literal("background_photo"),
  v.literal("photo_expansion"),
  v.literal("clipr_video"),
  v.literal("swapr_video"),
);
