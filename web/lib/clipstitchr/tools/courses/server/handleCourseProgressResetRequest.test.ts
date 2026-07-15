import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleCourseProgressResetRequest } from "@/lib/clipstitchr/tools/courses/server/handleCourseProgressResetRequest";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };
  return { convex };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    courseAccess: {
      resetCourseProgress: {
        resetCourseProgress: "courseAccess.resetCourseProgress",
      },
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: () => mocks.convex,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest(
  cookie = `clipstitchr_course_access_session=${"a".repeat(43)}`,
) {
  return new Request(
    "https://clipstitchr.test/api/tools/five-day-app-content-sprint/course-progress",
    {
      headers: {
        cookie,
        origin: "https://clipstitchr.test",
        "sec-fetch-site": "same-origin",
      },
      method: "DELETE",
    },
  );
}

describe("handleCourseProgressResetRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.convex.mutation.mockResolvedValue({ accepted: true });
  });

  it("resets only the requested course for the verified session", async () => {
    const response = await handleCourseProgressResetRequest(
      createRequest(),
      "five-day-app-content-sprint",
    );

    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      "courseAccess.resetCourseProgress",
      {
        courseKey: "five-day-app-content-sprint",
        resetAt: expect.any(Number),
        secret: "rate-limit-secret",
        sessionTokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      },
    );
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("requires the app-owned course session", async () => {
    const response = await handleCourseProgressResetRequest(
      createRequest(""),
      "five-day-app-content-sprint",
    );

    expect(response.status).toBe(401);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });
});
