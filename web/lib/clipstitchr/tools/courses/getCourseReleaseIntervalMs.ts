import type { CourseKey } from "./CourseKey";

const dayMs = 24 * 60 * 60 * 1_000;

export function getCourseReleaseIntervalMs(courseKey: CourseKey) {
  return courseKey === "app-creative-testing-system-workshop" ? 0 : dayMs;
}
