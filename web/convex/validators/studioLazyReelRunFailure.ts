import { v } from "convex/values";
import { studioLazyReelJsonSnapshotValidator } from "./studioLazyReelJsonSnapshot";

export const studioLazyReelRunFailureValidator = v.object({
  code: v.string(),
  message: v.string(),
  retryable: v.boolean(),
  detailsSnapshot: v.optional(studioLazyReelJsonSnapshotValidator),
});
