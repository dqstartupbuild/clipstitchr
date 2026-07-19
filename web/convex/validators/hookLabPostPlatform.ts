import { v } from "convex/values";

export const hookLabPostPlatformValidator = v.union(
  v.literal("tiktok"),
  v.literal("instagram"),
);
