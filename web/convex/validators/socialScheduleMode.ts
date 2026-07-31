import { v } from "convex/values";

export const socialScheduleModeValidator = v.union(
  v.literal("now"),
  v.literal("product_queue"),
  v.literal("exact_time"),
);
