import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { POST } from "@/app/api/stitchr/batch/generate/route";

const mocks = vi.hoisted(() => {
  const convex = {
    action: vi.fn(),
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    stitchrBatch: {
      plan: "stitchrBatch.plan",
    },
    workerDispatch: {
      runWorkerFromApi: "workerDispatch.runWorkerFromApi",
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient", () => ({
  createAuthenticatedConvexHttpClient: mocks.createAuthenticatedConvexHttpClient,
}));

vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken,
}));

vi.mock("@/lib/clipstitchr/server/automation/getAutomationWorkerSecret", () => ({
  getAutomationWorkerSecret: () => "automation-secret",
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

function createBatchGenerateRequest(
  body: Record<string, unknown> = {},
) {
  return new Request("https://clipstitchr.test/api/stitchr/batch/generate", {
    body: JSON.stringify({ productId: "product_1", ...body }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

describe("POST /api/stitchr/batch/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.convex.action.mockResolvedValue({
      executionName: "clipstitchr-provider-worker-abcde",
      worker: "provider",
    });
    mocks.convex.mutation.mockImplementation((name: unknown) => {
      if (name === api.stitchrBatch.plan) {
        return Promise.resolve({
          message: undefined,
          runId: "stitchr-batch:user_123:2026-06-17",
          status: "running",
          taskIds: ["task_1", "task_2"],
        });
      }

      return Promise.resolve(undefined);
    });
  });

  it("returns 401 before planning when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createBatchGenerateRequest());

    expect(response.status).toBe(401);
    expect(mocks.createAuthenticatedConvexHttpClient).not.toHaveBeenCalled();
  });

  it("plans a Stitchr batch for the signed-in user", async () => {
    const response = await POST(createBatchGenerateRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        batchDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        count: 2,
        providerDispatchStatus: "dispatched",
        runId: "stitchr-batch:user_123:2026-06-17",
        status: "running",
        taskIds: ["task_1", "task_2"],
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.stitchrBatch.plan,
      expect.objectContaining({
        secret: "automation-secret",
        ownerId: "user_123",
        providerLaunchDelayMs: 60000,
        runKey: expect.any(String),
      }),
    );
    expect(mocks.convex.action).toHaveBeenCalledWith(
      api.workerDispatch.runWorkerFromApi,
      {
        secret: "automation-secret",
        worker: "provider",
      },
    );
  });

  it("does not dispatch the provider when planning returns no active tasks", async () => {
    mocks.convex.mutation.mockImplementation((name: unknown) => {
      if (name === api.stitchrBatch.plan) {
        return Promise.resolve({
          message: "This Stitchr batch is already completed.",
          runId: "stitchr-batch:user_123:2026-06-17",
          status: "completed",
          taskIds: [],
        });
      }

      return Promise.resolve(undefined);
    });

    const response = await POST(createBatchGenerateRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        count: 0,
        providerDispatchStatus: "skipped",
        status: "completed",
        taskIds: [],
      }),
    );
    expect(mocks.convex.action).not.toHaveBeenCalled();
  });

  it("keeps the batch response successful when direct provider dispatch fails", async () => {
    mocks.convex.action.mockRejectedValueOnce(new Error("Cloud Run is busy"));

    const response = await POST(createBatchGenerateRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        providerDispatchStatus: "fallback_scheduled",
        status: "running",
      }),
    );
  });

  it("passes the selected soundtrack into planning", async () => {
    const request = createBatchGenerateRequest({ soundTrackId: "sound_1" });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.stitchrBatch.plan,
      expect.objectContaining({
        soundTrackId: "sound_1",
      }),
    );
  });

  it("plans the daily batch with the browser time zone", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-23T01:02:03.034Z"));

    try {
      const request = createBatchGenerateRequest({
        timeZone: "America/Detroit",
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(
        expect.objectContaining({
          batchDate: "2026-06-22",
        }),
      );
      expect(mocks.convex.mutation).toHaveBeenCalledWith(
        api.stitchrBatch.plan,
        expect.objectContaining({
          batchDate: "2026-06-22",
          now: "2026-06-23T01:02:03.034Z",
        }),
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("passes selected Batch text styling into planning", async () => {
    const request = createBatchGenerateRequest({
      stitchrTextBackgroundColorChoice: "#111111",
      stitchrTextColorChoice: "#f97316",
      stitchrTextStrokeColorChoice: "#ffffff",
      stitchrTextStyleChoice: "outline",
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.stitchrBatch.plan,
      expect.objectContaining({
        stitchrTextBackgroundColorChoice: "#111111",
        stitchrTextColorChoice: "#f97316",
        stitchrTextStrokeColorChoice: "#ffffff",
        stitchrTextStyleChoice: "outline",
      }),
    );
  });

  it("returns rate-limit responses from Convex planning", async () => {
    mocks.convex.mutation.mockImplementationOnce(() =>
      Promise.reject({
        data: {
          kind: "RateLimited",
          name: "stitchrBatchDaily",
          retryAfter: 1000,
        },
      }),
    );

    const response = await POST(createBatchGenerateRequest());

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "stitchrBatchDaily",
        retryAfterSeconds: 1,
      }),
    );
  });
});
