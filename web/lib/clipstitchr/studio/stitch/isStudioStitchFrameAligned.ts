import { STUDIO_STITCH_CANVAS } from "./studioStitchCanvas";

export function isStudioStitchFrameAligned(seconds: number): boolean {
  return (
    Number.isFinite(seconds) &&
    Math.abs(
      seconds * STUDIO_STITCH_CANVAS.framesPerSecond -
        Math.round(seconds * STUDIO_STITCH_CANVAS.framesPerSecond),
    ) < 1e-6
  );
}
