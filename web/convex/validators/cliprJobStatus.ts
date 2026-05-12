import { v } from "convex/values";

export const cliprJobStatusValidator = v.union(
  v.literal("queued"),
  v.literal("scripting"),
  v.literal("generating-scenes"),
  v.literal("ready-to-stitch"),
  v.literal("stitching"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("canceled"),
);
