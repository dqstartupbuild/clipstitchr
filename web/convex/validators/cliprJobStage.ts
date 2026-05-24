import { v } from "convex/values";

export const cliprJobStageValidator = v.union(
  v.literal("queued"),
  v.literal("hook-script"),
  v.literal("avatar-image"),
  v.literal("avatar-video"),
  v.literal("generated-video"),
  v.literal("media-compose"),
  v.literal("browser-save"),
  v.literal("finalized"),
  v.literal("failed"),
  v.literal("canceled"),
);
