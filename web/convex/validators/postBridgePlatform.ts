import { v } from "convex/values";

export const postBridgePlatformValidator = v.union(
  v.literal("tiktok"),
  v.literal("instagram"),
  v.literal("youtube"),
);
