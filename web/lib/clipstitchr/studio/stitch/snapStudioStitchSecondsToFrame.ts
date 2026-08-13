import { STUDIO_STITCH_CANVAS } from "./studioStitchCanvas";

export function snapStudioStitchSecondsToFrame(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new Error("Timeline seconds must be a finite non-negative number.");
  }
  return Math.round(seconds * STUDIO_STITCH_CANVAS.framesPerSecond) /
    STUDIO_STITCH_CANVAS.framesPerSecond;
}
