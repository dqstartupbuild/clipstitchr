import { v } from "convex/values";

export const studioLazyReelRunStatusValidator = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("failed"),
);
