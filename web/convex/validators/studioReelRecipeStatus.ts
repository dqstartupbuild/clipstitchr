import { v } from "convex/values";

export const studioReelRecipeStatusValidator = v.union(
  v.literal("active"),
  v.literal("archived"),
);
