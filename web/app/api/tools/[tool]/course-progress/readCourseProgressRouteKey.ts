import { isCourseKey } from "@/lib/clipstitchr/tools/courses/isCourseKey";

export async function readCourseProgressRouteKey(context: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await context.params;
  return isCourseKey(tool) ? tool : null;
}
