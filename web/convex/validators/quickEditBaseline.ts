import { v } from "convex/values";
import { quickEditSuggestionsValidator } from "./quickEditSuggestions";
import {
  textOverlayValidator,
  textOverlaysValidator,
} from "./textOverlay";
import { videoTrimRangeValidator } from "./videoTrimRange";

export const quickEditBaselineValidator = v.object({
  defaultTrimRange: v.optional(videoTrimRangeValidator),
  demoQuickEdit: v.optional(quickEditSuggestionsValidator),
  demoTrimRange: v.optional(videoTrimRangeValidator),
  duration: v.optional(v.number()),
  textOverlay: v.optional(textOverlayValidator),
  textOverlays: v.optional(textOverlaysValidator),
  ugcQuickEdit: v.optional(quickEditSuggestionsValidator),
  ugcTrimRange: v.optional(videoTrimRangeValidator),
});
