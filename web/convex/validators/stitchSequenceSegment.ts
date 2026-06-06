import { v } from "convex/values";
import { clipTypeValidator } from "./clipType";
import { videoCropBoundsValidator } from "./videoCropBounds";
import { videoPlaybackRateValidator } from "./videoPlaybackRate";
import { videoTrimRangeValidator } from "./videoTrimRange";

export const stitchSequenceSegmentValidator = v.object({
  clipId: v.string(),
  clipName: v.string(),
  clipType: clipTypeValidator,
  duration: v.number(),
  order: v.number(),
  cropBounds: v.optional(videoCropBoundsValidator),
  playbackRate: v.optional(videoPlaybackRateValidator),
  trimRange: videoTrimRangeValidator,
});
