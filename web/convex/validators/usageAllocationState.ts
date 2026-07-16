import { v } from "convex/values";

export const usageAllocationStateValidator = v.union(
  v.literal("reserved"),
  v.literal("committed"),
  v.literal("released"),
);
