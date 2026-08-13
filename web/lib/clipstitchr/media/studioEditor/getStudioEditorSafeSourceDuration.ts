export function getStudioEditorSafeSourceDuration(
  durationSeconds: number,
  fps: number,
) {
  const frameCount = Math.max(1, Math.floor(durationSeconds * fps + 1e-7));

  return Math.min(durationSeconds, frameCount / fps);
}
