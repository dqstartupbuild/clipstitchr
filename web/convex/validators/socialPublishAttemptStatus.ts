import { v } from "convex/values";

export const socialPublishAttemptStatusValidator = v.union(
  v.literal("running"),
  v.literal("succeeded"),
  v.literal("failed"),
  v.literal("ambiguous"),
);
