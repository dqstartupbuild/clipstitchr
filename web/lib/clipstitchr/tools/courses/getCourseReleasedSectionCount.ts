import type { CourseKey } from "./CourseKey";
import { getCourseReleaseIntervalMs } from "./getCourseReleaseIntervalMs";

export function getCourseReleasedSectionCount({
  activatedAt,
  courseKey,
  evaluatedAt,
  sectionCount,
}: {
  activatedAt: number;
  courseKey: CourseKey;
  evaluatedAt: number;
  sectionCount: number;
}) {
  if (sectionCount <= 0 || evaluatedAt < activatedAt) return 0;

  const intervalMs = getCourseReleaseIntervalMs(courseKey);

  if (intervalMs === 0) return sectionCount;

  return Math.min(
    sectionCount,
    Math.floor((evaluatedAt - activatedAt) / intervalMs) + 1,
  );
}
