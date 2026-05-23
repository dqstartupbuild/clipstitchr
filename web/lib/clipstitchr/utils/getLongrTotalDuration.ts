import type { SourcePlaybackRateOptions } from "@/lib/clipstitchr/types/SourcePlaybackRateOptions";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { getClipPlaybackRate } from "@/lib/clipstitchr/utils/getClipPlaybackRate";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";

export function getLongrTotalDuration(
  clips: VideoClipMetadata[],
  playbackRates: SourcePlaybackRateOptions = {},
) {
  return clips.reduce(
    (total, clip) =>
      total +
      getPlaybackRateDuration(
        getDefaultVideoTrimRange(clip),
        getClipPlaybackRate(clip.clipType, playbackRates),
      ),
    0,
  );
}
