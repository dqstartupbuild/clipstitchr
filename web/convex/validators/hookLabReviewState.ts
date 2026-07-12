import { v } from "convex/values";

export const hookLabReviewStateValidator = v.union(
  v.literal("needs_review"),
  v.literal("saved"),
  v.literal("not_for_me"),
);
