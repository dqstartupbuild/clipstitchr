import { describe, expect, it } from "vitest";
import { readCourseAccessSessionToken } from "@/lib/clipstitchr/tools/courses/session/readCourseAccessSessionToken";

describe("readCourseAccessSessionToken", () => {
  it("reads only a valid course session cookie", () => {
    const token = "a".repeat(43);
    const request = new Request("https://clipstitchr.test", {
      headers: {
        cookie: `other=value; clipstitchr_course_access_session=${token}`,
      },
    });

    expect(readCourseAccessSessionToken(request)).toBe(token);
  });

  it("rejects malformed values", () => {
    const request = new Request("https://clipstitchr.test", {
      headers: { cookie: "clipstitchr_course_access_session=plaintext" },
    });

    expect(readCourseAccessSessionToken(request)).toBeNull();
  });
});
