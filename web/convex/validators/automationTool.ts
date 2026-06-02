import { v } from "convex/values";

export const automationToolValidator = v.union(
  v.literal("stitchr"),
  v.literal("swapr"),
  v.literal("clipr"),
  v.literal("avatar-photo"),
  v.literal("swipr"),
);
