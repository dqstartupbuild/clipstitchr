export function getLazyReelWorkflowDuration(duration: number | undefined) {
  if (duration === undefined || !Number.isFinite(duration)) {
    return 15;
  }
  return Math.min(Math.max(Math.trunc(duration), 5), 180);
}
