import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { drawTextOverlays } from "@/lib/clipstitchr/media/drawTextOverlays";
import { drawVideoFrameToCanvas } from "@/lib/clipstitchr/media/drawVideoFrameToCanvas";
import { encodeCanvasAsPosterBlob } from "@/lib/clipstitchr/media/encodeCanvasAsPosterBlob";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getNonEmptyTextOverlays } from "@/lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getTextOverlayList } from "@/lib/clipstitchr/utils/getTextOverlayList";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";

type CreateStitchPosterBlobOptions = {
  demoClip: VideoClip;
  demoCropBounds?: VideoCropBounds;
  demoPlaybackRate?: VideoPlaybackRate;
  demoTrimRange: VideoTrimRange;
  duration: number;
  textOverlay: TextOverlay | null;
  textOverlays?: TextOverlay[];
  ugcClip: VideoClip;
  ugcCropBounds?: VideoCropBounds;
  ugcPlaybackRate?: VideoPlaybackRate;
  ugcTrimRange: VideoTrimRange;
};

export async function createStitchPosterBlob({
  demoClip,
  demoCropBounds,
  demoPlaybackRate = 1,
  demoTrimRange,
  duration,
  textOverlay,
  textOverlays,
  ugcClip,
  ugcCropBounds,
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
  const ugcDuration = getPlaybackRateDuration(
    clampedUgcTrimRange,
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
          cropBounds: ugcCropBounds,
          playbackRate: ugcPlaybackRate,
          timelineOffset: 0,
          trimRange: clampedUgcTrimRange,
        }
      : {
          clip: demoClip,
          cropBounds: demoCropBounds,
          playbackRate: demoPlaybackRate,
          timelineOffset: ugcDuration,
          trimRange: clampedDemoTrimRange,
        };
  const sourceOffset = Math.max(
    0,
    (posterTimelineTime - posterSource.timelineOffset) *
      posterSource.playbackRate,
  );
  const sourceTime = Math.min(
    posterSource.trimRange.end,
    posterSource.trimRange.start + sourceOffset,
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
    cropBounds: posterSource.cropBounds,
    time: sourceTime,
    videoBlob: posterSource.clip.blob,
  });

  if (visibleTextOverlays.length) {
    drawTextOverlays(context, visibleTextOverlays, posterTimelineTime);
  }

  return await encodeCanvasAsPosterBlob(canvas);
}
