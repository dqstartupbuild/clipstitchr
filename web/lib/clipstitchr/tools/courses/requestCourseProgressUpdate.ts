import type { CourseKey } from "@/lib/clipstitchr/tools/courses/CourseKey";

export async function requestCourseProgressUpdate(
  courseKey: CourseKey,
  update: { completed: boolean; itemId: string; note: string },
) {
  const response = await fetch(`/api/tools/${courseKey}/course-progress`, {
    body: JSON.stringify(update),
    cache: "no-store",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  });

  if (!response.ok) throw new Error("Course progress was not saved.");
}
