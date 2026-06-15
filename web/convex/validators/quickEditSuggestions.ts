import { v } from "convex/values";
import { quickEditCropValidator } from "./quickEditCrop";
import { quickEditOverlayTextValidator } from "./quickEditOverlayText";
import { quickEditRemoveRangeValidator } from "./quickEditRemoveRange";

export const quickEditSuggestionsValidator = v.object({
  trimStart: v.optional(v.number()),
  trimEnd: v.optional(v.union(v.number(), v.null())),
  removeRanges: v.array(quickEditRemoveRangeValidator),
  overlayText: v.optional(quickEditOverlayTextValidator),
  crop: v.optional(quickEditCropValidator),
  summary: v.optional(v.string()),
});
