import { v } from "convex/values";

export const loopsWebhookDispositionValidator = v.union(
  v.literal("applied"),
  v.literal("ignoredDuplicate"),
  v.literal("ignoredStale"),
  v.literal("ignoredUnlinked"),
);
