import type { CourseKey } from "./CourseKey";
import { getCourseReleaseIntervalMs } from "./getCourseReleaseIntervalMs";

export function getCourseSectionReleaseAt(
  courseKey: CourseKey,
  activatedAt: number,
  sectionIndex: number,
) {
  return activatedAt + getCourseReleaseIntervalMs(courseKey) * sectionIndex;
}
