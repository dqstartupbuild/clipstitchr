import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export function areVideoTrimRangesEqual(
  first: VideoTrimRange,
  second: VideoTrimRange,
) {
  return first.start === second.start && first.end === second.end;
}
