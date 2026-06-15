import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { getQuickEditSourceTimeForPlaybackTime } from "@/lib/clipstitchr/utils/getQuickEditSourceTimeForPlaybackTime";

type GetStitchTimelineQuickEditRemoveRangesOptions = {
  demoDuration: number;
  demoPlaybackRate?: VideoPlaybackRate;
  demoQuickEdit?: QuickEditSuggestions;
  demoTrimRange: VideoTrimRange;
  removeRanges: QuickEditRemoveRange[];
  ugcDuration: number;
  ugcPlaybackRate?: VideoPlaybackRate;
  ugcQuickEdit?: QuickEditSuggestions;
  ugcTrimRange: VideoTrimRange;
};

type StitchTimelineQuickEditRemoveRanges = {
  demoRemoveRanges: QuickEditRemoveRange[];
  ugcRemoveRanges: QuickEditRemoveRange[];
};

export function getStitchTimelineQuickEditRemoveRanges({
  demoDuration,
  demoPlaybackRate = 1,
  demoQuickEdit,
  demoTrimRange,
  removeRanges,
  ugcDuration,
  ugcPlaybackRate = 1,
  ugcQuickEdit,
  ugcTrimRange,
}: GetStitchTimelineQuickEditRemoveRangesOptions): StitchTimelineQuickEditRemoveRanges {
  const ugcTimelineDuration = getQuickEditPlaybackDuration(
    ugcTrimRange,
    ugcDuration,
    ugcQuickEdit?.removeRanges,
    ugcPlaybackRate,
  );
  const demoTimelineDuration = getQuickEditPlaybackDuration(
    demoTrimRange,
    demoDuration,
    demoQuickEdit?.removeRanges,
    demoPlaybackRate,
  );
  const totalTimelineDuration = ugcTimelineDuration + demoTimelineDuration;
  const ugcRemoveRanges: QuickEditRemoveRange[] = [];
  const demoRemoveRanges: QuickEditRemoveRange[] = [];

  for (const removeRange of removeRanges) {
    const start = clamp(removeRange.start, 0, totalTimelineDuration);
    const end = clamp(removeRange.end, 0, totalTimelineDuration);

    if (end <= start) {
      continue;
    }

    if (start < ugcTimelineDuration) {
      const ugcStart = start;
      const ugcEnd = Math.min(end, ugcTimelineDuration);
      const sourceStart = getQuickEditSourceTimeForPlaybackTime(
        ugcStart,
        ugcTrimRange,
        ugcDuration,
        ugcQuickEdit?.removeRanges,
        ugcPlaybackRate,
      );
      const sourceEnd = getQuickEditSourceTimeForPlaybackTime(
        ugcEnd,
        ugcTrimRange,
        ugcDuration,
        ugcQuickEdit?.removeRanges,
        ugcPlaybackRate,
      );

      if (sourceEnd > sourceStart) {
        ugcRemoveRanges.push({
          start: sourceStart,
          end: sourceEnd,
          ...(removeRange.reason ? { reason: removeRange.reason } : {}),
        });
      }
    }

    if (end > ugcTimelineDuration) {
      const demoStart = Math.max(0, start - ugcTimelineDuration);
      const demoEnd = Math.min(
        end - ugcTimelineDuration,
        demoTimelineDuration,
      );
      const sourceStart = getQuickEditSourceTimeForPlaybackTime(
        demoStart,
        demoTrimRange,
        demoDuration,
        demoQuickEdit?.removeRanges,
        demoPlaybackRate,
      );
      const sourceEnd = getQuickEditSourceTimeForPlaybackTime(
        demoEnd,
        demoTrimRange,
        demoDuration,
        demoQuickEdit?.removeRanges,
        demoPlaybackRate,
      );

      if (sourceEnd > sourceStart) {
        demoRemoveRanges.push({
          start: sourceStart,
          end: sourceEnd,
          ...(removeRange.reason ? { reason: removeRange.reason } : {}),
        });
      }
    }
  }

  return {
    demoRemoveRanges,
    ugcRemoveRanges,
  };
}
