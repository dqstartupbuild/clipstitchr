import { v } from "convex/values";

export const socialOAuthStateStatusValidator = v.union(
  v.literal("pending"),
  v.literal("consumed"),
  v.literal("expired"),
  v.literal("failed"),
);
