import { v } from "convex/values";

export const socialWebhookDispositionValidator = v.union(
  v.literal("received"),
  v.literal("processed"),
  v.literal("ignored"),
  v.literal("failed"),
);
