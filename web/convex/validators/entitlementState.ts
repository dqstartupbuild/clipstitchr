import { v } from "convex/values";

export const entitlementStateValidator = v.union(
  v.literal("active"),
  v.literal("grace"),
  v.literal("inactive"),
);
