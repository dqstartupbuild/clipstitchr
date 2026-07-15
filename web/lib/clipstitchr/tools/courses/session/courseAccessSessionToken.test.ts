import { describe, expect, it } from "vitest";
import { createCourseAccessSessionToken } from "@/lib/clipstitchr/tools/courses/session/createCourseAccessSessionToken";
import { hashCourseAccessSessionToken } from "@/lib/clipstitchr/tools/courses/session/hashCourseAccessSessionToken";

describe("course access session token", () => {
  it("creates a 256-bit URL-safe token and hashes it before storage", async () => {
    const token = createCourseAccessSessionToken();

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    await expect(hashCourseAccessSessionToken(token)).resolves.toMatch(
      /^[a-f0-9]{64}$/,
    );
  });
});
