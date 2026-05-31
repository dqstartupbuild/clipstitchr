import { v } from "convex/values";

export const automationTaskTypeValidator = v.union(
  v.literal("stitchr-render"),
  v.literal("swapr-video"),
  v.literal("clipr-video"),
  v.literal("avatar-photo"),
  v.literal("swipr-draft"),
);
