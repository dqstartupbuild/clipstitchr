import type { HookLabPostTimelineEntry } from "@/lib/clipstitchr/types/HookLabPostTimelineEntry";

export function getHookLabTimelineCoversVideo(
  timeline: HookLabPostTimelineEntry[],
  durationSeconds: number,
) {
  if (!timeline.length || durationSeconds <= 0) {
    return false;
  }

  const boundaryTolerance = Math.min(0.5, durationSeconds * 0.05);
  const maximumGapSeconds = Math.max(
    0.75,
    Math.min(2.5, durationSeconds * 0.08),
  );
  let coveredSeconds = 0;
  let coveredUntil = 0;

  for (const entry of timeline) {
    if (entry.startSeconds - coveredUntil > maximumGapSeconds) {
      return false;
    }

    const coveredStart = Math.max(coveredUntil, entry.startSeconds);
    coveredSeconds += Math.max(0, entry.endSeconds - coveredStart);
    coveredUntil = Math.max(coveredUntil, entry.endSeconds);
  }

  return (
    timeline[0].startSeconds <= boundaryTolerance &&
    coveredUntil >= durationSeconds - boundaryTolerance &&
    coveredSeconds / durationSeconds >= 0.9
  );
}
