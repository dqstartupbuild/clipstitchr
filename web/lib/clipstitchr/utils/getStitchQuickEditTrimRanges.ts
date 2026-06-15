import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { getQuickEditSourceTimeForPlaybackTime } from "@/lib/clipstitchr/utils/getQuickEditSourceTimeForPlaybackTime";

type GetStitchQuickEditTrimRangesOptions = {
  demoDuration: number;
  demoPlaybackRate?: VideoPlaybackRate;
  demoQuickEdit?: QuickEditSuggestions;
  demoTrimRange: VideoTrimRange;
  quickEdit: QuickEditSuggestions;
  ugcDuration: number;
  ugcPlaybackRate?: VideoPlaybackRate;
  ugcQuickEdit?: QuickEditSuggestions;
  ugcTrimRange: VideoTrimRange;
};

type StitchQuickEditTrimRanges = {
  demoTrimRange: VideoTrimRange;
  ugcTrimRange: VideoTrimRange;
};

export function getStitchQuickEditTrimRanges({
  demoDuration,
  demoPlaybackRate = 1,
  demoQuickEdit,
  demoTrimRange,
  quickEdit,
  ugcDuration,
  ugcPlaybackRate = 1,
  ugcQuickEdit,
  ugcTrimRange,
}: GetStitchQuickEditTrimRangesOptions): StitchQuickEditTrimRanges {
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
  let nextUgcTrimRange = ugcTrimRange;
  let nextDemoTrimRange = demoTrimRange;

  if (quickEdit.trimStart !== undefined) {
    if (quickEdit.trimStart < ugcTimelineDuration) {
      nextUgcTrimRange = clampVideoTrimRange(
        {
          ...nextUgcTrimRange,
          start: getQuickEditSourceTimeForPlaybackTime(
            quickEdit.trimStart,
            ugcTrimRange,
            ugcDuration,
            ugcQuickEdit?.removeRanges,
            ugcPlaybackRate,
          ),
        },
        ugcDuration,
      );
    } else {
      nextDemoTrimRange = clampVideoTrimRange(
        {
          ...nextDemoTrimRange,
          start: getQuickEditSourceTimeForPlaybackTime(
            quickEdit.trimStart - ugcTimelineDuration,
            demoTrimRange,
            demoDuration,
            demoQuickEdit?.removeRanges,
            demoPlaybackRate,
          ),
        },
        demoDuration,
      );
    }
  }

  if (quickEdit.trimEnd !== undefined && quickEdit.trimEnd !== null) {
    if (quickEdit.trimEnd <= ugcTimelineDuration) {
      nextUgcTrimRange = clampVideoTrimRange(
        {
          ...nextUgcTrimRange,
          end: getQuickEditSourceTimeForPlaybackTime(
            quickEdit.trimEnd,
            ugcTrimRange,
            ugcDuration,
            ugcQuickEdit?.removeRanges,
            ugcPlaybackRate,
          ),
        },
        ugcDuration,
      );
    } else if (quickEdit.trimEnd < ugcTimelineDuration + demoTimelineDuration) {
      nextDemoTrimRange = clampVideoTrimRange(
        {
          ...nextDemoTrimRange,
          end: getQuickEditSourceTimeForPlaybackTime(
            quickEdit.trimEnd - ugcTimelineDuration,
            demoTrimRange,
            demoDuration,
            demoQuickEdit?.removeRanges,
            demoPlaybackRate,
          ),
        },
        demoDuration,
      );
    }
  }

  return {
    demoTrimRange: nextDemoTrimRange,
    ugcTrimRange: nextUgcTrimRange,
  };
}
