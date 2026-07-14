import { v } from "convex/values";

export const browserRecognitionRevocationReasonValidator = v.union(
  v.literal("rotated"),
  v.literal("expired"),
  v.literal("privacyDeletion"),
);
