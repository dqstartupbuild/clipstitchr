import { v } from "convex/values";
import { quickEditBaselineValidator } from "./quickEditBaseline";
import { quickEditCropValidator } from "./quickEditCrop";
import { quickEditOverlayTextValidator } from "./quickEditOverlayText";
import { quickEditRemoveRangeValidator } from "./quickEditRemoveRange";

export const quickEditMetadataValidator = v.object({
  trimStart: v.optional(v.number()),
  trimEnd: v.optional(v.union(v.number(), v.null())),
  removeRanges: v.array(quickEditRemoveRangeValidator),
  overlayText: v.optional(quickEditOverlayTextValidator),
  crop: v.optional(quickEditCropValidator),
  summary: v.optional(v.string()),
  appliedAt: v.string(),
  baseline: v.optional(quickEditBaselineValidator),
  source: v.literal("ai-score"),
});
