import { v } from "convex/values";

export const socialPostTargetStatusValidator = v.union(
  v.literal("scheduled"),
  v.literal("queued"),
  v.literal("publishing"),
  v.literal("status_check"),
  v.literal("waiting_for_user"),
  v.literal("published"),
  v.literal("failed"),
  v.literal("needs_attention"),
  v.literal("held"),
  v.literal("canceled"),
  v.literal("outcome_unknown"),
);
