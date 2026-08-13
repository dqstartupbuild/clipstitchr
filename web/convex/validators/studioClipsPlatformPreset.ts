import { v } from "convex/values";

export const studioClipsPlatformPresetValidator = v.union(
  v.literal("tiktok"),
  v.literal("instagram_reels"),
  v.literal("youtube_shorts"),
);
