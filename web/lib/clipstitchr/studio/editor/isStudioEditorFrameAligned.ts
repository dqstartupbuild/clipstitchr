export function isStudioEditorFrameAligned(seconds: number, fps: number) {
  if (!Number.isFinite(seconds) || !Number.isFinite(fps) || fps <= 0) {
    return false;
  }

  return Math.abs(seconds * fps - Math.round(seconds * fps)) <= 1e-7;
}
