import { v } from "convex/values";
import { clipTypeValidator } from "./clipType";
import { videoTrimRangeValidator } from "./videoTrimRange";

export const longrClipSegmentValidator = v.object({
  clipId: v.string(),
  clipName: v.string(),
  clipType: clipTypeValidator,
  duration: v.number(),
  order: v.number(),
  trimRange: videoTrimRangeValidator,
});
