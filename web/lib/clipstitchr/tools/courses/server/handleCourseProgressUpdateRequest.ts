import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import type { CourseKey } from "@/lib/clipstitchr/tools/courses/CourseKey";
import { createCourseProgressRateLimitResponse } from "@/lib/clipstitchr/tools/courses/server/createCourseProgressRateLimitResponse";
import { readCourseProgressUpdateRequest } from "@/lib/clipstitchr/tools/courses/server/readCourseProgressUpdateRequest";
import { hashCourseAccessSessionToken } from "@/lib/clipstitchr/tools/courses/session/hashCourseAccessSessionToken";
import { readCourseAccessSessionToken } from "@/lib/clipstitchr/tools/courses/session/readCourseAccessSessionToken";
import { ToolLeadRequestError } from "@/lib/clipstitchr/tools/toolLeads/server/ToolLeadRequestError";
import { createToolLeadClientKey } from "@/lib/clipstitchr/tools/toolLeads/server/createToolLeadClientKey";
import { getToolLeadRequestIsSameOrigin } from "@/lib/clipstitchr/tools/toolLeads/server/getToolLeadRequestIsSameOrigin";

export async function handleCourseProgressUpdateRequest(
  request: Request,
  courseKey: CourseKey,
) {
  if (!getToolLeadRequestIsSameOrigin(request)) {
    return Response.json(
      { message: "Unable to save this update." },
      { headers: { "Cache-Control": "private, no-store" }, status: 403 },
    );
  }

  try {
    const sessionToken = readCourseAccessSessionToken(request);
    const update = await readCourseProgressUpdateRequest(request);

    if (!sessionToken) {
      return Response.json(
        { message: "Confirm your email again to keep saving progress." },
        { headers: { "Cache-Control": "private, no-store" }, status: 401 },
      );
    }

    const secret = getRateLimitApiSecret();
    const result = await createConvexHttpClient().mutation(
      api.courseAccess.updateCourseProgressItem.updateCourseProgressItem,
      {
        ...update,
        clientKey: createToolLeadClientKey(request, secret),
        courseKey,
        secret,
        sessionTokenHash: await hashCourseAccessSessionToken(sessionToken),
        updatedAt: Date.now(),
      },
    );

    return Response.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const rateLimitResponse = createCourseProgressRateLimitResponse(error);
    if (rateLimitResponse) return rateLimitResponse;

    if (error instanceof ToolLeadRequestError) {
      return Response.json(
        { message: "Unable to save this update." },
        {
          headers: { "Cache-Control": "private, no-store" },
          status: error.status,
        },
      );
    }

    return Response.json(
      { message: "Unable to save this update right now." },
      { headers: { "Cache-Control": "private, no-store" }, status: 500 },
    );
  }
}
