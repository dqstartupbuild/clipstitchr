import { v } from "convex/values";

export const automationRunStatusValidator = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("skipped"),
  v.literal("failed"),
  v.literal("canceled"),
);
