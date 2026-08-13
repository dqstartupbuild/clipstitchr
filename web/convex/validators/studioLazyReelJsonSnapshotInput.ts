import { v } from "convex/values";

export const studioLazyReelJsonSnapshotInputValidator = v.object({
  schemaVersion: v.string(),
  payloadJson: v.string(),
});
