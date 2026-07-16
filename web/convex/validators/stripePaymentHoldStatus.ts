import { v } from "convex/values";

export const stripePaymentHoldStatusValidator = v.union(
  v.literal("open"),
  v.literal("resolved"),
);
