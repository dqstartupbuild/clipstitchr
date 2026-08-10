import { v } from "convex/values";

export const socialPublishingPlatformValidator = v.union(
  v.literal("tiktok"),
  v.literal("instagram"),
  v.literal("youtube"),
);
