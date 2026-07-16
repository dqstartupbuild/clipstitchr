import { v } from "convex/values";

export const accountEmailTemplateKeyValidator = v.union(
  v.literal("account-created"),
  v.literal("subscription-status"),
  v.literal("credits-updated"),
  v.literal("payment-alert"),
);
