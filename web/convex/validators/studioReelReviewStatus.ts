import { v } from "convex/values";

export const studioReelReviewStatusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
);
