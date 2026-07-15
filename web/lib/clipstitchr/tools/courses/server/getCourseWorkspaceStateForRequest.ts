import "server-only";

import { cookies } from "next/headers";
import { api } from "@/convex/_generated/api";
import type { CourseKey } from "@/lib/clipstitchr/tools/courses/CourseKey";
import type { CourseWorkspaceState } from "@/lib/clipstitchr/tools/courses/CourseWorkspaceState";
import { courseAccessSessionCookieName } from "@/lib/clipstitchr/tools/courses/session/courseAccessSessionCookieName";
import { hashCourseAccessSessionToken } from "@/lib/clipstitchr/tools/courses/session/hashCourseAccessSessionToken";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

const tokenPattern = /^[A-Za-z0-9_-]{43}$/;

export async function getCourseWorkspaceStateForRequest(
  courseKey: CourseKey,
): Promise<CourseWorkspaceState> {
  const token = (await cookies()).get(courseAccessSessionCookieName)?.value;

  if (!token || !tokenPattern.test(token)) {
    return {
      availableSectionCount: 0,
      hasAccess: false,
      hasSession: false,
      progressItems: [],
    };
  }

  try {
    return await createConvexHttpClient().mutation(
      api.courseAccess.readCourseWorkspace.readCourseWorkspace,
      {
        accessedAt: Date.now(),
        courseKey,
        secret: getRateLimitApiSecret(),
        sessionTokenHash: await hashCourseAccessSessionToken(token),
      },
    );
  } catch {
    return {
      availableSectionCount: 0,
      hasAccess: false,
      hasSession: false,
      progressItems: [],
    };
  }
}
