import { v } from "convex/values";

export const subscriptionCheckoutReturnTargetValidator = v.union(
  v.literal("onboarding"),
  v.literal("settings"),
);
