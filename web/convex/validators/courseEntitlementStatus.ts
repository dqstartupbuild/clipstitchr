import { v } from "convex/values";

export const courseEntitlementStatusValidator = v.union(
  v.literal("pendingConfirmation"),
  v.literal("active"),
);
