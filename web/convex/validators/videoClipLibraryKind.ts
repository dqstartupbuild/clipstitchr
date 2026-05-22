import { v } from "convex/values";

export const videoClipLibraryKindValidator = v.union(
  v.literal("clipr"),
  v.literal("demo"),
  v.literal("swapr"),
  v.literal("ugc"),
);
