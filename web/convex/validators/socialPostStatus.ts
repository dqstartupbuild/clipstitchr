import { v } from "convex/values";

export const socialPostStatusValidator = v.union(
  v.literal("draft"),
  v.literal("scheduled"),
  v.literal("publishing"),
  v.literal("waiting_for_user"),
  v.literal("partially_published"),
  v.literal("published"),
  v.literal("failed"),
  v.literal("needs_attention"),
  v.literal("held"),
  v.literal("canceled"),
  v.literal("outcome_unknown"),
);
