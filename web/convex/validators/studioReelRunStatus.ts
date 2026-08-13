import { v } from "convex/values";

export const studioReelRunStatusValidator = v.union(
  v.literal("blocked"),
  v.literal("intentReady"),
  v.literal("canceled"),
  v.literal("failed"),
  v.literal("completed"),
);
