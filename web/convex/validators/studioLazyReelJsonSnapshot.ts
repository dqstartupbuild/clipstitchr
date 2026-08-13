import { v } from "convex/values";

export const studioLazyReelJsonSnapshotValidator = v.object({
  schemaVersion: v.string(),
  payloadJson: v.string(),
  byteLength: v.number(),
});
