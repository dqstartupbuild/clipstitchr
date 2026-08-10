import { v } from "convex/values";

export const socialPublishingPostStatusValidator = v.union(
  v.literal("posted"),
  v.literal("scheduled"),
  v.literal("processing"),
  v.literal("partial"),
  v.literal("failed"),
);
