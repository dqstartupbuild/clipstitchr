import { v } from "convex/values";

export const planKeyValidator = v.union(
  v.literal("starter"),
  v.literal("pro"),
  v.literal("agency"),
);
