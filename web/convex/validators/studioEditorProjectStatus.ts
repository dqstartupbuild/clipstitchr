import { v } from "convex/values";

export const studioEditorProjectStatusValidator = v.union(
  v.literal("active"),
  v.literal("archived"),
);
