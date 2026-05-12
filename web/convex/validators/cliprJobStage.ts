import { v } from "convex/values";

export const cliprJobStageValidator = v.union(
  v.literal("queued"),
  v.literal("hook-script"),
  v.literal("scene-generation"),
  v.literal("browser-stitching"),
  v.literal("finalized"),
  v.literal("failed"),
  v.literal("canceled"),
);
