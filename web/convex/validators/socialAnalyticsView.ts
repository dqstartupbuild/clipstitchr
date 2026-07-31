import { v } from "convex/values";

export const socialAnalyticsViewValidator = v.union(
  v.literal("published_in_period"),
  v.literal("growth_during_period"),
);
