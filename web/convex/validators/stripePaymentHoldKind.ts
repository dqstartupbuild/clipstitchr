import { v } from "convex/values";

export const stripePaymentHoldKindValidator = v.union(
  v.literal("refund"),
  v.literal("dispute"),
);
