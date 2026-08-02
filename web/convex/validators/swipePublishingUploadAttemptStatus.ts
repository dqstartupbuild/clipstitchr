import { v } from "convex/values";

export const swipePublishingUploadAttemptStatusValidator = v.union(
  v.literal("reserved"),
  v.literal("committed"),
);
