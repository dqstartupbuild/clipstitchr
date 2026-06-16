import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { drawTextOverlays } from "@/lib/clipstitchr/media/drawTextOverlays";
import { drawVideoFrameToCanvas } from "@/lib/clipstitchr/media/drawVideoFrameToCanvas";
import { encodeCanvasAsPosterBlob } from "@/lib/clipstitchr/media/encodeCanvasAsPosterBlob";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getNonEmptyTextOverlays } from "@/lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getTextOverlayList } from "@/lib/clipstitchr/utils/getTextOverlayList";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { getQuickEditSourceTimeForPlaybackTime } from "@/lib/clipstitchr/utils/getQuickEditSourceTimeForPlaybackTime";

type CreateStitchPosterBlobOptions = {
  demoClip: VideoClip;
  demoQuickEdit?: QuickEditSuggestions;
  demoPlaybackRate?: VideoPlaybackRate;
  demoTrimRange: VideoTrimRange;
  duration: number;
  textOverlay: TextOverlay | null;
  textOverlays?: TextOverlay[];
  ugcClip: VideoClip;
  ugcQuickEdit?: QuickEditSuggestions;
  ugcPlaybackRate?: VideoPlaybackRate;
  ugcTrimRange: VideoTrimRange;
};

export async function createStitchPosterBlob({
  demoClip,
  demoQuickEdit,
  demoPlaybackRate = 1,
  demoTrimRange,
  duration,
  textOverlay,
  textOverlays,
  ugcClip,
  ugcQuickEdit,
  ugcPlaybackRate = 1,
  ugcTrimRange,
}: CreateStitchPosterBlobOptions): Promise<Blob> {
  const clampedUgcTrimRange = clampVideoTrimRange(
    ugcTrimRange,
    ugcClip.duration,
  );
  const clampedDemoTrimRange = clampVideoTrimRange(
    demoTrimRange,
    demoClip.duration,
  );
  const ugcDuration = getQuickEditPlaybackDuration(
    clampedUgcTrimRange,
    ugcClip.duration,
    ugcQuickEdit?.removeRanges,
    ugcPlaybackRate,
  );
  const visibleTextOverlays = getNonEmptyTextOverlays(
    getTextOverlayList(textOverlays, textOverlay).map((overlay) =>
      clampTextOverlay(overlay, duration),
    ),
  );
  const firstVisibleTextOverlay = visibleTextOverlays[0] ?? null;
  const posterTimelineTime = firstVisibleTextOverlay
    ? Math.min(
        Math.max(firstVisibleTextOverlay.startTime, 0),
        firstVisibleTextOverlay.endTime,
        duration,
      )
    : 0;
  const posterSource =
    posterTimelineTime < ugcDuration
      ? {
          clip: ugcClip,
          playbackRate: ugcPlaybackRate,
          quickEdit: ugcQuickEdit,
          timelineOffset: 0,
          trimRange: clampedUgcTrimRange,
        }
      : {
          clip: demoClip,
          playbackRate: demoPlaybackRate,
          quickEdit: demoQuickEdit,
          timelineOffset: ugcDuration,
          trimRange: clampedDemoTrimRange,
        };
  const sourceTime = getQuickEditSourceTimeForPlaybackTime(
    posterTimelineTime - posterSource.timelineOffset,
    posterSource.trimRange,
    posterSource.clip.duration,
    posterSource.quickEdit?.removeRanges,
    posterSource.playbackRate,
  );
  const canvas = document.createElement("canvas");
  canvas.width = TIKTOK_OUTPUT_WIDTH;
  canvas.height = TIKTOK_OUTPUT_HEIGHT;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create stitch poster canvas.");
  }

  await drawVideoFrameToCanvas({
    canvas,
    context,
    crop: posterSource.quickEdit?.crop,
    time: sourceTime,
    videoBlob: posterSource.clip.blob,
  });

  if (visibleTextOverlays.length) {
    drawTextOverlays(context, visibleTextOverlays, posterTimelineTime);
  }

  return await encodeCanvasAsPosterBlob(canvas);
}
