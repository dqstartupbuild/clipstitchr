import { v } from "convex/values";

export const studioReelWriteOperationValidator = v.union(
  v.literal("createRecipe"),
  v.literal("archiveRecipe"),
  v.literal("reopenRecipe"),
  v.literal("createRun"),
  v.literal("cancelRun"),
  v.literal("resumeRun"),
  v.literal("retryRun"),
  v.literal("createRemainingRun"),
  v.literal("failRun"),
  v.literal("completeRun"),
  v.literal("approveReviewSubset"),
  v.literal("recordOutput"),
  v.literal("acceptOutput"),
  v.literal("materializeOutput"),
);
