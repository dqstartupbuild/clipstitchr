import { courseAccessSessionCookieName } from "@/lib/clipstitchr/tools/courses/session/courseAccessSessionCookieName";

const courseAccessSessionTokenPattern = /^[A-Za-z0-9_-]{43}$/;

export function readCourseAccessSessionToken(request: Request) {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = cookie.trim().split("=");

    if (rawName !== courseAccessSessionCookieName) continue;

    const value = decodeURIComponent(rawValueParts.join("="));
    return courseAccessSessionTokenPattern.test(value) ? value : null;
  }

  return null;
}
