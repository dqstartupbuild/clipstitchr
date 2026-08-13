import { v } from "convex/values";
import { studioLazyReelJsonSnapshotInputValidator } from "./studioLazyReelJsonSnapshotInput";

export const studioLazyReelRunFailureInputValidator = v.object({
  code: v.string(),
  message: v.string(),
  retryable: v.boolean(),
  detailsSnapshot: v.optional(studioLazyReelJsonSnapshotInputValidator),
});
