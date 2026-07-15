import { courseAccessSessionCookieName } from "@/lib/clipstitchr/tools/courses/session/courseAccessSessionCookieName";

export function createExpiredCourseAccessSessionCookieHeader(secure: boolean) {
  const attributes = [
    `${courseAccessSessionCookieName}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Strict",
  ];

  if (secure) attributes.push("Secure");

  return attributes.join("; ");
}
