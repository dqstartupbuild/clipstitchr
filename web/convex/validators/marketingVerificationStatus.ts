import { v } from "convex/values";

export const marketingVerificationStatusValidator = v.union(
  v.literal("unverified"),
  v.literal("pending"),
  v.literal("verified"),
);
