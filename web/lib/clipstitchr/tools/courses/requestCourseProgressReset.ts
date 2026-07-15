import type { CourseKey } from "@/lib/clipstitchr/tools/courses/CourseKey";

export async function requestCourseProgressReset(courseKey: CourseKey) {
  const response = await fetch(`/api/tools/${courseKey}/course-progress`, {
    cache: "no-store",
    credentials: "same-origin",
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Course progress was not reset.");
}
