import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { createQuickEditSuggestionsFromMetadata } from "@/lib/clipstitchr/utils/createQuickEditSuggestionsFromMetadata";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";

export function getVideoClipPlaybackDuration(
  clip: VideoClipMetadata,
  trimRange: VideoTrimRange = getDefaultVideoTrimRange(clip),
  playbackRate: VideoPlaybackRate = 1,
) {
  const quickEdit = createQuickEditSuggestionsFromMetadata(clip.quickEdit);

  return getQuickEditPlaybackDuration(
    trimRange,
    clip.duration,
    quickEdit?.removeRanges,
    playbackRate,
  );
}
