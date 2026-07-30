import { v } from "convex/values";

export const socialAnalyticsSnapshotInputValidator = v.object({
  source: v.string(),
  views: v.union(v.number(), v.null()),
  reach: v.union(v.number(), v.null()),
  likes: v.union(v.number(), v.null()),
  comments: v.union(v.number(), v.null()),
  shares: v.union(v.number(), v.null()),
  saves: v.union(v.number(), v.null()),
  watchTimeSeconds: v.union(v.number(), v.null()),
  availabilityJson: v.string(),
});
