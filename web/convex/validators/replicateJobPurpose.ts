import { v } from "convex/values";

export const replicateJobPurposeValidator = v.union(
  v.literal("swapr-video"),
);
