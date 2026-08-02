import { v } from "convex/values";

export const postBridgeMediaKindValidator = v.union(
  v.literal("image"),
  v.literal("video"),
);
