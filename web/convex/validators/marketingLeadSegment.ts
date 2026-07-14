import { v } from "convex/values";

export const marketingLeadSegmentValidator = v.union(
  v.literal("hooks-and-messaging"),
  v.literal("content-planning"),
  v.literal("production-readiness"),
  v.literal("economics-and-scaling"),
  v.literal("learning-and-systems"),
  v.literal("unclassified"),
);
