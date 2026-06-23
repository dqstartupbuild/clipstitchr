import { v } from "convex/values";

export const stitchrHookPlanStatusValidator = v.union(
  v.literal("planned"),
  v.literal("failed"),
  v.literal("fallback"),
);
