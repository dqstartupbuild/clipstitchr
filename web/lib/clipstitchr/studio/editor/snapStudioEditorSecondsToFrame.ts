export function snapStudioEditorSecondsToFrame(
  seconds: number,
  fps: number,
): number {
  if (!Number.isFinite(seconds) || !Number.isFinite(fps) || fps <= 0) {
    throw new Error(
      "Frame snapping requires finite seconds and a positive FPS.",
    );
  }

  const snapped = Math.round(seconds * fps) / fps;
  return Object.is(snapped, -0) ? 0 : snapped;
}
