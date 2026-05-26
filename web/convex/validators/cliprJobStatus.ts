import { v } from "convex/values";

export const cliprJobStatusValidator = v.union(
  v.literal("queued"),
  v.literal("scripting"),
  v.literal("generating-avatar-image"),
  v.literal("generating-avatar-video"),
  v.literal("ready-to-save"),
  v.literal("saving"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("canceled"),
);
