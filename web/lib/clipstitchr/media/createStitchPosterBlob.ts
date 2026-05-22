import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { drawTextOverlay } from "@/lib/clipstitchr/media/drawTextOverlay";
import { drawVideoFrameToCanvas } from "@/lib/clipstitchr/media/drawVideoFrameToCanvas";
import { encodeCanvasAsPosterBlob } from "@/lib/clipstitchr/media/encodeCanvasAsPosterBlob";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type CreateStitchPosterBlobOptions = {
  demoClip: VideoClip;
  demoTrimRange: VideoTrimRange;
  duration: number;
  textOverlay: TextOverlay | null;
  ugcClip: VideoClip;
  ugcTrimRange: VideoTrimRange;
};

export async function createStitchPosterBlob({
  demoClip,
  demoTrimRange,
  duration,
  textOverlay,
  ugcClip,
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
  const ugcDuration = getVideoTrimRangeDuration(clampedUgcTrimRange);
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
          timelineOffset: 0,
          trimRange: clampedUgcTrimRange,
        }
      : {
          clip: demoClip,
          timelineOffset: ugcDuration,
          trimRange: clampedDemoTrimRange,
        };
  const sourceOffset = Math.max(
    0,
    posterTimelineTime - posterSource.timelineOffset,
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
