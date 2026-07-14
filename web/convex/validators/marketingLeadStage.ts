import { v } from "convex/values";

export const marketingLeadStageValidator = v.union(
  v.literal("captured"),
  v.literal("engaged"),
  v.literal("high-intent"),
  v.literal("product-interested"),
  v.literal("converted"),
);
