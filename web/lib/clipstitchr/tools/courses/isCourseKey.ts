import { courseKeys } from "./courseKeys";
import type { CourseKey } from "./CourseKey";

export function isCourseKey(value: string): value is CourseKey {
  return courseKeys.some((courseKey) => courseKey === value);
}
