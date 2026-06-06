import { CanvasSink, type CanvasSource, type Input } from "mediabunny";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { drawTextOverlays } from "@/lib/clipstitchr/media/drawTextOverlays";
import type { TextOverlayRenderContext } from "@/lib/clipstitchr/media/createTextOverlayRenderContext";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getMediaBunnyCropRectangle } from "@/lib/clipstitchr/media/getMediaBunnyCropRectangle";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type CopyTextOverlayVideoFramesOptions = {
  input: Input;
  playbackRate?: VideoPlaybackRate;
  source: CanvasSource;
  renderContext: TextOverlayRenderContext;
  timelineOffset: number;
  trimRange: VideoTrimRange;
  cropBounds?: VideoCropBounds | null;
  textOverlay?: TextOverlay;
  textOverlays?: TextOverlay[];
  onProgress?: (progress: number) => void;
};

type CopyTextOverlayVideoFramesResult = {
  endTimestamp: number;
};

export async function copyTextOverlayVideoFramesToSource({
  input,
  playbackRate = 1,
  source,
  renderContext,
  timelineOffset,
  trimRange,
  cropBounds,
  textOverlay,
  textOverlays,
  onProgress,
}: CopyTextOverlayVideoFramesOptions): Promise<CopyTextOverlayVideoFramesResult> {
  const track = await input.getPrimaryVideoTrack();

  if (!track) {
    throw new Error("A normalized clip was missing its video track.");
  }

  const [displayWidth, displayHeight] = await Promise.all([
    track.getDisplayWidth(),
    track.getDisplayHeight(),
  ]);
  const crop = getMediaBunnyCropRectangle({
    cropBounds,
    height: displayHeight,
    width: displayWidth,
  });
  const sink = new CanvasSink(track, {
    ...(crop ? { crop, fit: "cover" as const } : { fit: "fill" as const }),
    width: TIKTOK_OUTPUT_WIDTH,
    height: TIKTOK_OUTPUT_HEIGHT,
    rotation: 0,
    poolSize: 1,
  });
  const sourceOffset = await track.getFirstTimestamp();
  const duration = await track.computeDuration();
  const clampedTrimRange = clampVideoTrimRange(trimRange, duration);
  const trimDuration = getVideoTrimRangeDuration(clampedTrimRange);
  const outputDuration = getPlaybackRateDuration(
    clampedTrimRange,
    playbackRate,
  );
  const sourceStartTimestamp = sourceOffset + clampedTrimRange.start;
  const sourceEndTimestamp = sourceOffset + clampedTrimRange.end;
  const outputEndTimestamp = timelineOffset + outputDuration;
  const overlays = textOverlays ?? (textOverlay ? [textOverlay] : []);
  let isFirstFrame = true;
  let endTimestamp = timelineOffset;

  for await (const frame of sink.canvases(
    sourceStartTimestamp,
    sourceEndTimestamp,
  )) {
    const sourceTimestamp = frame.timestamp;
    const outputTimestamp =
      Math.max(0, sourceTimestamp - sourceStartTimestamp) / playbackRate +
      timelineOffset;
    const frameDuration = Math.min(
      frame.duration / playbackRate,
      outputEndTimestamp - outputTimestamp,
    );

    if (frameDuration <= 0) {
      continue;
    }

    renderContext.context.clearRect(
      0,
      0,
      TIKTOK_OUTPUT_WIDTH,
      TIKTOK_OUTPUT_HEIGHT,
    );
    renderContext.context.drawImage(
      frame.canvas,
      0,
      0,
      TIKTOK_OUTPUT_WIDTH,
      TIKTOK_OUTPUT_HEIGHT,
    );
    drawTextOverlays(renderContext.context, overlays, outputTimestamp);

    await source.add(
      outputTimestamp,
      frameDuration,
      isFirstFrame ? { keyFrame: true } : undefined,
    );
    isFirstFrame = false;
    endTimestamp = Math.max(endTimestamp, outputTimestamp + frameDuration);
    onProgress?.(
      trimDuration > 0
        ? Math.min(
            1,
            Math.max(
              0,
              (sourceTimestamp - sourceStartTimestamp) / trimDuration,
            ),
          )
        : 1,
    );
  }

  onProgress?.(1);

  return { endTimestamp };
}
