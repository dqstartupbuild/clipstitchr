import { v } from "convex/values";

export const postBridgeSourceTypeValidator = v.union(
  v.literal("stitch"),
  v.literal("swipe"),
);
