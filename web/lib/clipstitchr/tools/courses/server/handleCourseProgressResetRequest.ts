import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import type { CourseKey } from "@/lib/clipstitchr/tools/courses/CourseKey";
import { createCourseProgressRateLimitResponse } from "@/lib/clipstitchr/tools/courses/server/createCourseProgressRateLimitResponse";
import { hashCourseAccessSessionToken } from "@/lib/clipstitchr/tools/courses/session/hashCourseAccessSessionToken";
import { readCourseAccessSessionToken } from "@/lib/clipstitchr/tools/courses/session/readCourseAccessSessionToken";
import { getToolLeadRequestIsSameOrigin } from "@/lib/clipstitchr/tools/toolLeads/server/getToolLeadRequestIsSameOrigin";

export async function handleCourseProgressResetRequest(
  request: Request,
  courseKey: CourseKey,
) {
  if (!getToolLeadRequestIsSameOrigin(request)) {
    return Response.json(
      { message: "Unable to reset this progress." },
      { headers: { "Cache-Control": "private, no-store" }, status: 403 },
    );
  }

  try {
    const sessionToken = readCourseAccessSessionToken(request);

    if (!sessionToken) {
      return Response.json(
        { message: "Confirm your email again to reset progress." },
        { headers: { "Cache-Control": "private, no-store" }, status: 401 },
      );
    }

    const result = await createConvexHttpClient().mutation(
      api.courseAccess.resetCourseProgress.resetCourseProgress,
      {
        courseKey,
        resetAt: Date.now(),
        secret: getRateLimitApiSecret(),
        sessionTokenHash: await hashCourseAccessSessionToken(sessionToken),
      },
    );

    return Response.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const rateLimitResponse = createCourseProgressRateLimitResponse(error);
    if (rateLimitResponse) return rateLimitResponse;

    return Response.json(
      { message: "Unable to reset this progress right now." },
      { headers: { "Cache-Control": "private, no-store" }, status: 500 },
    );
  }
}
