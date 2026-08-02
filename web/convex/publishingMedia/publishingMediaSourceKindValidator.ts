import { v } from "convex/values";

export const publishingMediaSourceKindValidator = v.union(
  v.literal("stitch"),
  v.literal("swipe"),
  v.literal("library-media"),
);
