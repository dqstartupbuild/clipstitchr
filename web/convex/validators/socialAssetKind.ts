import { v } from "convex/values";

export const socialAssetKindValidator = v.union(
  v.literal("video"),
  v.literal("image"),
);
