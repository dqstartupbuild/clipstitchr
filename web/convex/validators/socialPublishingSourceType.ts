import { v } from "convex/values";

export const socialPublishingSourceTypeValidator = v.union(
  v.literal("stitch"),
  v.literal("swipe"),
);
