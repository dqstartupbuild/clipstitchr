import { v } from "convex/values";

export const creditGrantTypeValidator = v.union(
  v.literal("monthly"),
  v.literal("refill"),
  v.literal("support"),
);
