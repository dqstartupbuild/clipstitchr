export function normalizeActiveWorkerJobProgressPercent(progress?: number) {
  if (typeof progress !== "number" || Number.isNaN(progress)) {
    return null;
  }

  const percent = progress <= 1 ? progress * 100 : progress;

  return Math.max(0, Math.min(100, percent));
}
