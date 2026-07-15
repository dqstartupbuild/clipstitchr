import { handleCourseProgressResetRequest } from "@/lib/clipstitchr/tools/courses/server/handleCourseProgressResetRequest";
import { handleCourseProgressUpdateRequest } from "@/lib/clipstitchr/tools/courses/server/handleCourseProgressUpdateRequest";
import { readCourseProgressRouteKey } from "@/app/api/tools/[tool]/course-progress/readCourseProgressRouteKey";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ tool: string }> },
) {
  const courseKey = await readCourseProgressRouteKey(context);
  return courseKey
    ? handleCourseProgressUpdateRequest(request, courseKey)
    : Response.json(
        { message: "Course not found." },
        { headers: { "Cache-Control": "private, no-store" }, status: 404 },
      );
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ tool: string }> },
) {
  const courseKey = await readCourseProgressRouteKey(context);
  return courseKey
    ? handleCourseProgressResetRequest(request, courseKey)
    : Response.json(
        { message: "Course not found." },
        { headers: { "Cache-Control": "private, no-store" }, status: 404 },
      );
}
