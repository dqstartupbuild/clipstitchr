import { v } from "convex/values";

export const hookLabIdeaSourceTypeValidator = v.union(
  v.literal("text"),
  v.literal("social_link"),
  v.literal("stitch"),
  v.literal("generated_hook"),
  v.literal("migrated_template"),
);
