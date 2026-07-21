import { v } from "convex/values";

export const hookLabDestinationToolValidator = v.union(
  v.literal("clipr"),
  v.literal("stitchr"),
  v.literal("swipr"),
);
