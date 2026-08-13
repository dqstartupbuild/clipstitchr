export function getLazyReelWorkflowClipCount(durationSeconds: number) {
  return Math.max(3, Math.ceil(durationSeconds / 4));
}
