import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleCourseProgressUpdateRequest } from "@/lib/clipstitchr/tools/courses/server/handleCourseProgressUpdateRequest";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

  return {
    convex,
    createToolLeadClientKey: vi.fn(() => "b".repeat(64)),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    courseAccess: {
      updateCourseProgressItem: {
        updateCourseProgressItem: "courseAccess.updateCourseProgressItem",
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

vi.mock(
  "@/lib/clipstitchr/tools/toolLeads/server/createToolLeadClientKey",
  () => ({
    createToolLeadClientKey: mocks.createToolLeadClientKey,
  }),
);

function createRequest({
  body = JSON.stringify({
    completed: true,
    itemId: "ugc-inventory",
    note: "Ready",
  }),
  cookie = `clipstitchr_course_access_session=${"a".repeat(43)}`,
  origin = "https://clipstitchr.test",
  secFetchSite = "same-origin",
}: {
  body?: string;
  cookie?: string;
  origin?: string;
  secFetchSite?: string;
} = {}) {
  return new Request(
    "https://clipstitchr.test/api/tools/five-day-app-content-sprint/course-progress",
    {
      body,
      headers: {
        "content-type": "application/json",
        cookie,
        origin,
        "sec-fetch-site": secFetchSite,
      },
      method: "PATCH",
    },
  );
}

describe("handleCourseProgressUpdateRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.convex.mutation.mockResolvedValue({ accepted: true, saved: true });
  });

  it("saves only the bounded course progress projection", async () => {
    const response = await handleCourseProgressUpdateRequest(
      createRequest({
        body: JSON.stringify({
          analyticsId: "must-not-be-forwarded",
          completed: true,
          itemId: "ugc-inventory",
          note: "Ready",
          toolAnswer: "must-not-be-forwarded",
        }),
      }),
      "five-day-app-content-sprint",
    );

    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      "courseAccess.updateCourseProgressItem",
      expect.objectContaining({
        clientKey: "b".repeat(64),
        completed: true,
        courseKey: "five-day-app-content-sprint",
        itemId: "ugc-inventory",
        note: "Ready",
        secret: "rate-limit-secret",
        sessionTokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        updatedAt: expect.any(Number),
      }),
    );
    const mutationArgs = mocks.convex.mutation.mock.calls[0]?.[1];
    expect(mutationArgs).not.toHaveProperty("analyticsId");
    expect(mutationArgs).not.toHaveProperty("toolAnswer");
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("rejects cross-site requests and missing course sessions", async () => {
    const crossSiteResponse = await handleCourseProgressUpdateRequest(
      createRequest({
        origin: "https://attacker.test",
        secFetchSite: "cross-site",
      }),
      "five-day-app-content-sprint",
    );
    const missingSessionResponse = await handleCourseProgressUpdateRequest(
      createRequest({ cookie: "" }),
      "five-day-app-content-sprint",
    );

    expect(crossSiteResponse.status).toBe(403);
    expect(missingSessionResponse.status).toBe(401);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("rejects oversized notes before the Convex mutation", async () => {
    const response = await handleCourseProgressUpdateRequest(
      createRequest({
        body: JSON.stringify({
          completed: true,
          itemId: "ugc-inventory",
          note: "x".repeat(601),
        }),
      }),
      "five-day-app-content-sprint",
    );

    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
  });

  it("returns generic retry timing without exposing the rate-limit bucket", async () => {
    mocks.convex.mutation.mockRejectedValue({
      data: {
        kind: "RateLimited",
        name: "courseProgressWriteBySession",
        retryAfter: 1_500,
      },
    });

    const response = await handleCourseProgressUpdateRequest(
      createRequest(),
      "five-day-app-content-sprint",
    );
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("2");
    expect(body).toEqual({
      message: "Too many progress updates. Try again in a moment.",
    });
    expect(JSON.stringify(body)).not.toContain("courseProgressWriteBySession");
  });
});
