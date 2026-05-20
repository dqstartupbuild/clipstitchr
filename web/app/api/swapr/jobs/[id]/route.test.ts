import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/swapr/jobs/[id]/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };
  const replicate = {
    predictions: {
      get: vi.fn(),
    },
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createReplicateClient: vi.fn(() => replicate),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    replicate,
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeSwaprJobPoll: "rateLimits.consumeSwaprJobPoll",
    },
    replicateJobs: {
      updateSwaprJobStatus: "replicateJobs.updateSwaprJobStatus",
    },
  },
}));

vi.mock(
  "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient",
  () => ({
    createAuthenticatedConvexHttpClient: mocks.createAuthenticatedConvexHttpClient,
  }),
);

vi.mock("@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken", () => ({
  getAuthenticatedConvexToken: mocks.getAuthenticatedConvexToken,
}));

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createContext(id = "prediction_1") {
  return {
    params: Promise.resolve({ id }),
  };
}

describe("GET /api/swapr/jobs/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.replicate.predictions.get.mockResolvedValue({
      error: null,
      id: "prediction_1",
      output: ["https://replicate.example/output.mp4"],
      status: "succeeded",
      urls: {
        get: "https://replicate.example/prediction_1",
      },
    });
  });

  it("returns 401 before polling when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await GET(new Request("https://clipstitchr.test"), createContext());

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("polls Replicate and records Swapr job status", async () => {
    const response = await GET(new Request("https://clipstitchr.test"), createContext());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        id: "prediction_1",
        output: ["https://replicate.example/output.mp4"],
        status: "succeeded",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeSwaprJobPoll,
      {
        predictionId: "prediction_1",
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.replicate.predictions.get).toHaveBeenCalledWith(
      "prediction_1",
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.replicateJobs.updateSwaprJobStatus,
      expect.objectContaining({
        outputUrl: "https://replicate.example/output.mp4",
        predictionId: "prediction_1",
        status: "succeeded",
      }),
    );
  });

  it("returns provider and rate-limit failures", async () => {
    mocks.replicate.predictions.get.mockRejectedValueOnce(
      new Error("provider unavailable"),
    );

    const failedResponse = await GET(
      new Request("https://clipstitchr.test"),
      createContext(),
    );

    await expect(failedResponse.json()).resolves.toEqual({
      message: "provider unavailable",
    });
    expect(failedResponse.status).toBe(500);

    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "swaprJobPoll",
        retryAfter: 2000,
      },
    });

    const rateLimitResponse = await GET(
      new Request("https://clipstitchr.test"),
      createContext(),
    );

    expect(rateLimitResponse.status).toBe(429);
  });
});
