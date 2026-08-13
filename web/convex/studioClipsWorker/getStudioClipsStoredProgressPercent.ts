const NON_ADVANCING_PROGRESS_CODES = new Set([
  "cancelled",
  "failed",
  "worker_started",
]);

export function getStudioClipsStoredProgressPercent(input: {
  code: string;
  currentProgressPercent: number;
  reportedProgressPercent: number;
}) {
  if (input.reportedProgressPercent >= input.currentProgressPercent) {
    return input.reportedProgressPercent;
  }

  if (NON_ADVANCING_PROGRESS_CODES.has(input.code)) {
    return input.currentProgressPercent;
  }

  throw new Error("Studio Clips progress cannot move backward.");
}
