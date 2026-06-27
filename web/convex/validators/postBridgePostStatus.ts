import { v } from "convex/values";

export const postBridgePostStatusValidator = v.union(
  v.literal("posted"),
  v.literal("scheduled"),
  v.literal("processing"),
  v.literal("failed"),
);
