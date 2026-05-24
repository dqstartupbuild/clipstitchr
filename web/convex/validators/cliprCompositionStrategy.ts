import { v } from "convex/values";

export const cliprCompositionStrategyValidator = v.union(
  v.literal("single-video"),
  v.literal("multi-scene"),
);
