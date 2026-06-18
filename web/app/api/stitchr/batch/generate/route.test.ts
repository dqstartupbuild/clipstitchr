import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { POST } from "@/app/api/stitchr/batch/generate/route";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
  };

  return {
    convex,
    createConvexHttpClient: vi.fn(() => convex),
    getAuthenticatedUserId: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    automationStitchr: {
      planDaily: "automationStitchr.planDaily",
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: mocks.createConvexHttpClient,
}));

vi.mock("@/lib/clipstitchr/server/automation/getAutomationWorkerSecret", () => ({
  getAutomationWorkerSecret: () => "automation-secret",
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

describe("POST /api/stitchr/batch/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.convex.mutation.mockResolvedValue({
      message: undefined,
      runId: "automation:stitchr:user_123:2026-06-17",
      status: "running",
      taskIds: ["task_1", "task_2"],
    });
  });

  it("returns 401 before planning when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
    expect(mocks.createConvexHttpClient).not.toHaveBeenCalled();
  });

  it("plans a Stitchr batch for the signed-in user", async () => {
    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        count: 2,
        runId: "automation:stitchr:user_123:2026-06-17",
        status: "running",
        taskIds: ["task_1", "task_2"],
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.automationStitchr.planDaily,
      expect.objectContaining({
        secret: "automation-secret",
        ownerId: "user_123",
      }),
    );
  });

  it("returns rate-limit responses from Convex planning", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "automationStitchrDaily",
        retryAfter: 1000,
      },
    });

    const response = await POST();

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "automationStitchrDaily",
        retryAfterSeconds: 1,
      }),
    );
  });
});
