import { v } from "convex/values";

export const hookLabIdeaVariantStatusValidator = v.union(
  v.literal("queued"),
  v.literal("writing"),
  v.literal("creating_opening"),
  v.literal("finalizing"),
  v.literal("completed"),
  v.literal("failed"),
);
