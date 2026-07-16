import { v } from "convex/values";

export const usageResourceValidator = v.union(
  v.literal("creation_credit"),
  v.literal("ai_video"),
);
