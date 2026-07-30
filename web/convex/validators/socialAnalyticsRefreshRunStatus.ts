import { v } from "convex/values";

export const socialAnalyticsRefreshRunStatusValidator = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("partially_completed"),
  v.literal("failed"),
  v.literal("canceled"),
);
