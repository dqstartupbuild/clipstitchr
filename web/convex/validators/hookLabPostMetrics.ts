import { v } from "convex/values";

export const hookLabPostMetricsValidator = v.object({
  commentCount: v.optional(v.number()),
  likeCount: v.optional(v.number()),
  playCount: v.optional(v.number()),
  saveCount: v.optional(v.number()),
  shareCount: v.optional(v.number()),
});
