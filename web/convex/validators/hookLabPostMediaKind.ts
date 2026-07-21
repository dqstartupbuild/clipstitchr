import { v } from "convex/values";

export const hookLabPostMediaKindValidator = v.union(
  v.literal("video"),
  v.literal("slideshow"),
);
