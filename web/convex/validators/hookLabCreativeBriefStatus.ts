import { v } from "convex/values";

export const hookLabCreativeBriefStatusValidator = v.union(
  v.literal("draft"),
  v.literal("approved"),
  v.literal("used"),
);
