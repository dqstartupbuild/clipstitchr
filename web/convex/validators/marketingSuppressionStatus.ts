import { v } from "convex/values";

export const marketingSuppressionStatusValidator = v.union(
  v.literal("none"),
  v.literal("hardBounce"),
  v.literal("complaint"),
  v.literal("providerSuppressed"),
);
