import { fiveDayContentSprintDefinition } from "@/lib/clipstitchr/tools/fiveDayContentSprint/fiveDayContentSprintDefinition";
import { testingSystemWorkshopDefinition } from "@/lib/clipstitchr/tools/testingSystemWorkshop/testingSystemWorkshopDefinition";
import type { CourseKey } from "@/lib/clipstitchr/tools/courses/CourseKey";
import { ugcMiniCourseDefinition } from "@/lib/clipstitchr/tools/ugcMiniCourse/ugcMiniCourseDefinition";

export function getCourseDefinition(courseKey: CourseKey) {
  if (courseKey === "five-day-app-content-sprint") {
    return fiveDayContentSprintDefinition;
  }

  if (courseKey === "ugc-to-app-ad-mini-course") {
    return ugcMiniCourseDefinition;
  }

  return testingSystemWorkshopDefinition;
}
