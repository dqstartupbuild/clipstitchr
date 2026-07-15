import { courseAccessSessionCookieName } from "@/lib/clipstitchr/tools/courses/session/courseAccessSessionCookieName";
import { courseAccessSessionTtlSeconds } from "@/lib/clipstitchr/tools/courses/session/courseAccessSessionTtlSeconds";

export function createCourseAccessSessionCookieHeader(
  token: string,
  secure: boolean,
) {
  const attributes = [
    `${courseAccessSessionCookieName}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${courseAccessSessionTtlSeconds}`,
    "HttpOnly",
    "SameSite=Strict",
  ];

  if (secure) attributes.push("Secure");

  return attributes.join("; ");
}
