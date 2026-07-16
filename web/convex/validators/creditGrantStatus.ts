import { v } from "convex/values";

export const creditGrantStatusValidator = v.union(
  v.literal("available"),
  v.literal("exhausted"),
  v.literal("expired"),
  v.literal("revoked"),
);
