import { v } from "convex/values";
import { stitchrModeValidator } from "./stitchrMode";
import { quickEditSuggestionsValidator } from "./quickEditSuggestions";
import { stitchMusicMetadataValidator } from "./stitchMusicMetadata";
import { stitchSequenceSegmentValidator } from "./stitchSequenceSegment";
import { textOverlayValidator, textOverlaysValidator } from "./textOverlay";
import { videoPlaybackRateValidator } from "./videoPlaybackRate";
import { videoTrimRangeValidator } from "./videoTrimRange";

export const hookLabStitchRecipeValidator = v.object({
  demoClipId: v.string(),
  demoClipName: v.string(),
  demoPlaybackRate: v.optional(videoPlaybackRateValidator),
  demoQuickEdit: v.optional(quickEditSuggestionsValidator),
  demoTrimRange: v.optional(videoTrimRangeValidator),
  duration: v.number(),
  height: v.number(),
  includeDemoAudio: v.optional(v.boolean()),
  includeUgcAudio: v.optional(v.boolean()),
  mode: v.optional(stitchrModeValidator),
  music: v.optional(stitchMusicMetadataValidator),
  sequenceSegments: v.optional(v.array(stitchSequenceSegmentValidator)),
  socialCaption: v.optional(v.string()),
  textOverlay: v.optional(textOverlayValidator),
  textOverlays: v.optional(textOverlaysValidator),
  ugcClipId: v.string(),
  ugcClipName: v.string(),
  ugcPlaybackRate: v.optional(videoPlaybackRateValidator),
  ugcQuickEdit: v.optional(quickEditSuggestionsValidator),
  ugcTrimRange: v.optional(videoTrimRangeValidator),
  width: v.number(),
});
