import { v } from "convex/values";

export const musicTrackSourceValidator = v.union(
  v.literal("clipr"),
  v.literal("stitchr"),
  v.literal("longr"),
  v.literal("swipr"),
  v.literal("library"),
);
