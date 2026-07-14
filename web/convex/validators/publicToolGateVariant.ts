import { v } from "convex/values";

export const publicToolGateVariantValidator = v.union(
  v.literal("control"),
  v.literal("hybrid-v1"),
);
