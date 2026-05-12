import { v } from "convex/values";

export const replicateJobPurposeValidator = v.union(
  v.literal("avatar-photo"),
  v.literal("swapr-video"),
);
