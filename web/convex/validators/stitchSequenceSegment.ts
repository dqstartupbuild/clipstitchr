import { v } from "convex/values";
import { clipTypeValidator } from "./clipType";
import { videoPlaybackRateValidator } from "./videoPlaybackRate";
import { videoTrimRangeValidator } from "./videoTrimRange";

export const stitchSequenceSegmentValidator = v.object({
  clipId: v.string(),
  clipName: v.string(),
  clipType: clipTypeValidator,
  duration: v.number(),
  order: v.number(),
  playbackRate: v.optional(videoPlaybackRateValidator),
  trimRange: videoTrimRangeValidator,
});
