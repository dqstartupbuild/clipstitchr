import { v } from "convex/values";

export const socialPlatformValidator = v.union(
  v.literal("tiktok"),
  v.literal("instagram"),
);
