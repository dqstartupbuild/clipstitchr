import { v } from "convex/values";

export const replicateJobPurposeValidator = v.union(
  v.literal("avatar-photo"),
  v.literal("clipr-audio"),
  v.literal("clipr-video"),
  v.literal("swapr-video"),
);
