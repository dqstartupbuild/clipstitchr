export function formatStudioEditorTimecode(seconds: number, fps = 30) {
  const clamped = Math.max(0, seconds);
  const wholeSeconds = Math.floor(clamped);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;
  const frames = Math.min(fps - 1, Math.floor((clamped % 1) * fps + 1e-6));

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
}
