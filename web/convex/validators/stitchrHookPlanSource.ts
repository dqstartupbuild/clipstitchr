import { v } from "convex/values";

export const stitchrHookPlanSourceValidator = v.union(
  v.literal("batch_planner"),
  v.literal("worker_fallback"),
  v.literal("manual"),
);
