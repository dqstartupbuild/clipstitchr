import { v } from "convex/values";

export const studioReelWorkerFailureKindValidator = v.union(
  v.literal("permanent"),
  v.literal("retryable"),
  v.literal("uncertain"),
);
