import { v } from "convex/values";

export const stripeWebhookEventStatusValidator = v.union(
  v.literal("processing"),
  v.literal("processed"),
  v.literal("ignored"),
  v.literal("failed"),
);
