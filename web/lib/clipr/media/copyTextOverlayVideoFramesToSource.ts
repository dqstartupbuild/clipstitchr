import { CanvasSink, type CanvasSource, type Input } from "mediabunny";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipr/constants/tiktokOutputSize";
import { drawTextOverlay } from "@/lib/clipr/media/drawTextOverlay";
import type { TextOverlayRenderContext } from "@/lib/clipr/media/createTextOverlayRenderContext";
import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";

type CopyTextOverlayVideoFramesOptions = {
  input: Input;
  source: CanvasSource;
  renderContext: TextOverlayRenderContext;
  timelineOffset: number;
  textOverlay: TextOverlay;
  onProgress?: (progress: number) => void;
};

type CopyTextOverlayVideoFramesResult = {
  endTimestamp: number;
};

export async function copyTextOverlayVideoFramesToSource({
  input,
  source,
  renderContext,
  timelineOffset,
  textOverlay,
  onProgress,
}: CopyTextOverlayVideoFramesOptions): Promise<CopyTextOverlayVideoFramesResult> {
  const track = await input.getPrimaryVideoTrack();

  if (!track) {
    throw new Error("A normalized clip was missing its video track.");
  }

  const sink = new CanvasSink(track, {
    width: TIKTOK_OUTPUT_WIDTH,
    height: TIKTOK_OUTPUT_HEIGHT,
    fit: "fill",
    rotation: 0,
    poolSize: 1,
  });
  const sourceOffset = await track.getFirstTimestamp();
  const duration = await track.computeDuration();
  let isFirstFrame = true;
  let endTimestamp = timelineOffset;

  for await (const frame of sink.canvases()) {
    const sourceTimestamp = frame.timestamp;
    const outputTimestamp = Math.max(0, sourceTimestamp - sourceOffset) + timelineOffset;

    renderContext.context.clearRect(0, 0, TIKTOK_OUTPUT_WIDTH, TIKTOK_OUTPUT_HEIGHT);
    renderContext.context.drawImage(
      frame.canvas,
      0,
      0,
      TIKTOK_OUTPUT_WIDTH,
      TIKTOK_OUTPUT_HEIGHT,
    );
    drawTextOverlay(renderContext.context, textOverlay, outputTimestamp);

    await source.add(
      outputTimestamp,
      frame.duration,
      isFirstFrame ? { keyFrame: true } : undefined,
    );
    isFirstFrame = false;
    endTimestamp = Math.max(endTimestamp, outputTimestamp + frame.duration);
    onProgress?.(
      duration > 0
        ? Math.min(1, Math.max(0, (sourceTimestamp - sourceOffset) / duration))
        : 1,
    );
  }

  return { endTimestamp };
}
