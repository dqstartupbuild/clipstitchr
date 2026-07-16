import { v } from "convex/values";

export const billingPortalFlowValidator = v.union(
  v.literal("home"),
  v.literal("subscription_update"),
);
