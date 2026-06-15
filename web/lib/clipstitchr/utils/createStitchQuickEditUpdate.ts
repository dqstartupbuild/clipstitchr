import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { createQuickEditSuggestionsFromMetadata } from "@/lib/clipstitchr/utils/createQuickEditSuggestionsFromMetadata";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { getQuickEditSuggestionsWithRemoveRanges } from "@/lib/clipstitchr/utils/getQuickEditSuggestionsWithRemoveRanges";
import { getQuickEditTextOverlays } from "@/lib/clipstitchr/utils/getQuickEditTextOverlays";
import { getStitchQuickEditTrimRanges } from "@/lib/clipstitchr/utils/getStitchQuickEditTrimRanges";
import { getStitchTimelineQuickEditRemoveRanges } from "@/lib/clipstitchr/utils/getStitchTimelineQuickEditRemoveRanges";

type CreateStitchQuickEditUpdateOptions = {
  demoClip: VideoClipMetadata;
  quickEdit: QuickEditSuggestions;
  stitch: Stitch;
  ugcClip: VideoClipMetadata;
};

type StitchQuickEditUpdate = {
  demoQuickEdit?: QuickEditSuggestions;
  demoTrimRange: VideoTrimRange;
  duration: number;
  quickEdit: QuickEditSuggestions;
  textOverlay: TextOverlay | null;
  textOverlays: TextOverlay[];
  ugcQuickEdit?: QuickEditSuggestions;
  ugcTrimRange: VideoTrimRange;
};

export function createStitchQuickEditUpdate({
  demoClip,
  quickEdit,
  stitch,
  ugcClip,
}: CreateStitchQuickEditUpdateOptions): StitchQuickEditUpdate {
  const ugcPlaybackRate = stitch.ugcPlaybackRate ?? 1;
  const demoPlaybackRate = stitch.demoPlaybackRate ?? 1;
  const currentUgcQuickEdit = createQuickEditSuggestionsFromMetadata(
    stitch.ugcQuickEdit,
  );
  const currentDemoQuickEdit = createQuickEditSuggestionsFromMetadata(
    stitch.demoQuickEdit,
  );
  const currentUgcTrimRange = clampVideoTrimRange(
    stitch.ugcTrimRange ?? { start: 0, end: ugcClip.duration },
    ugcClip.duration,
  );
  const currentDemoTrimRange = clampVideoTrimRange(
    stitch.demoTrimRange ?? { start: 0, end: demoClip.duration },
    demoClip.duration,
  );
  const ugcTimelineDuration = getQuickEditPlaybackDuration(
    currentUgcTrimRange,
    ugcClip.duration,
    currentUgcQuickEdit?.removeRanges,
    ugcPlaybackRate,
  );
  const { demoRemoveRanges, ugcRemoveRanges } =
    getStitchTimelineQuickEditRemoveRanges({
      demoDuration: demoClip.duration,
      demoPlaybackRate,
      demoQuickEdit: currentDemoQuickEdit,
      demoTrimRange: currentDemoTrimRange,
      removeRanges: quickEdit.removeRanges,
      ugcDuration: ugcClip.duration,
      ugcPlaybackRate,
      ugcQuickEdit: currentUgcQuickEdit,
      ugcTrimRange: currentUgcTrimRange,
    });
  const nextUgcRemoveRanges: QuickEditRemoveRange[] = [...ugcRemoveRanges];
  const nextDemoRemoveRanges: QuickEditRemoveRange[] = [...demoRemoveRanges];

  if (
    quickEdit.trimStart !== undefined &&
    quickEdit.trimStart >= ugcTimelineDuration
  ) {
    nextUgcRemoveRanges.push({
      start: currentUgcTrimRange.start,
      end: currentUgcTrimRange.end,
      reason: "Quick Edit starts after this section.",
    });
  }

  if (
    quickEdit.trimEnd !== undefined &&
    quickEdit.trimEnd !== null &&
    quickEdit.trimEnd <= ugcTimelineDuration
  ) {
    nextDemoRemoveRanges.push({
      start: currentDemoTrimRange.start,
      end: currentDemoTrimRange.end,
      reason: "Quick Edit ends before this section.",
    });
  }

  const { demoTrimRange, ugcTrimRange } = getStitchQuickEditTrimRanges({
    demoDuration: demoClip.duration,
    demoPlaybackRate,
    demoQuickEdit: currentDemoQuickEdit,
    demoTrimRange: currentDemoTrimRange,
    quickEdit,
    ugcDuration: ugcClip.duration,
    ugcPlaybackRate,
    ugcQuickEdit: currentUgcQuickEdit,
    ugcTrimRange: currentUgcTrimRange,
  });
  const ugcQuickEdit = getQuickEditSuggestionsWithRemoveRanges({
    duration: ugcClip.duration,
    quickEdit: currentUgcQuickEdit,
    removeRanges: nextUgcRemoveRanges,
  });
  const demoQuickEdit = getQuickEditSuggestionsWithRemoveRanges({
    duration: demoClip.duration,
    quickEdit: currentDemoQuickEdit,
    removeRanges: nextDemoRemoveRanges,
  });
  const duration =
    getQuickEditPlaybackDuration(
      ugcTrimRange,
      ugcClip.duration,
      ugcQuickEdit?.removeRanges,
      ugcPlaybackRate,
    ) +
    getQuickEditPlaybackDuration(
      demoTrimRange,
      demoClip.duration,
      demoQuickEdit?.removeRanges,
      demoPlaybackRate,
    );
  const textOverlays = getQuickEditTextOverlays({
    duration,
    overlayText: quickEdit.overlayText,
    textOverlay: stitch.textOverlay,
    textOverlays: stitch.textOverlays,
  });

  return {
    demoQuickEdit,
    demoTrimRange,
    duration,
    quickEdit: createQuickEditSuggestionsFromMetadata(quickEdit) ?? quickEdit,
    textOverlay: textOverlays[0] ?? null,
    textOverlays,
    ugcQuickEdit,
    ugcTrimRange,
  };
}
