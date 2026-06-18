import { v } from "convex/values";

export const notificationSourceTypeValidator = v.union(
  v.literal("automation-run"),
  v.literal("avatar"),
  v.literal("photo"),
  v.literal("stitch"),
  v.literal("stitchr-batch"),
  v.literal("swipe"),
  v.literal("video-clip"),
);
