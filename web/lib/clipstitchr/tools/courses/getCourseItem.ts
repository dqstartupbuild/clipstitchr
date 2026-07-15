import type { CourseKey } from "./CourseKey";
import { courseSectionItemIds } from "./courseSectionItemIds";

export function getCourseItem(courseKey: CourseKey, itemId: string) {
  const sections = courseSectionItemIds[courseKey];

  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
    const item = sections[sectionIndex]?.find((candidate) => candidate === itemId);

    if (item) {
      return { itemId: item, sectionIndex };
    }
  }

  return null;
}
