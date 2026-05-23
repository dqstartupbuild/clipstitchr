import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { drawTextOverlay } from "@/lib/clipstitchr/media/drawTextOverlay";
import { drawVideoFrameToCanvas } from "@/lib/clipstitchr/media/drawVideoFrameToCanvas";
import { encodeCanvasAsPosterBlob } from "@/lib/clipstitchr/media/encodeCanvasAsPosterBlob";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";

type CreateStitchPosterBlobOptions = {
  demoClip: VideoClip;
  demoPlaybackRate?: VideoPlaybackRate;
  demoTrimRange: VideoTrimRange;
  duration: number;
  textOverlay: TextOverlay | null;
  ugcClip: VideoClip;
  ugcPlaybackRate?: VideoPlaybackRate;
  ugcTrimRange: VideoTrimRange;
};

export async function createStitchPosterBlob({
  demoClip,
  demoPlaybackRate = 1,
  demoTrimRange,
  duration,
  textOverlay,
  ugcClip,
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
  const visibleTextOverlay =
    textOverlay && textOverlay.text.trim().length > 0
      ? clampTextOverlay(textOverlay, duration)
      : null;
  const posterTimelineTime = visibleTextOverlay
    ? Math.min(
        Math.max(visibleTextOverlay.startTime, 0),
        visibleTextOverlay.endTime,
        duration,
      )
    : 0;
  const posterSource =
    posterTimelineTime < ugcDuration
      ? {
          clip: ugcClip,
          playbackRate: ugcPlaybackRate,
          timelineOffset: 0,
          trimRange: clampedUgcTrimRange,
        }
      : {
          clip: demoClip,
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
    time: sourceTime,
    videoBlob: posterSource.clip.blob,
  });

  if (visibleTextOverlay) {
    drawTextOverlay(context, visibleTextOverlay, posterTimelineTime);
  }

  return await encodeCanvasAsPosterBlob(canvas);
}
