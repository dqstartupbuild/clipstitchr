import { v } from "convex/values";

export const socialPublishingMediaKindValidator = v.union(
  v.literal("image"),
  v.literal("video"),
);
