import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/swipr/backgrounds/analyze/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createReplicateClient: vi.fn(() => ({ provider: "replicate" })),
    createSwiprBackgroundAnalysisOutputText: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    parseSwiprBackgroundAnalysis: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeSwiprBackgroundAnalyze: "rateLimits.consumeSwiprBackgroundAnalyze",
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

vi.mock(
  "@/lib/clipstitchr/server/createSwiprBackgroundAnalysisOutputText",
  () => ({
    createSwiprBackgroundAnalysisOutputText:
      mocks.createSwiprBackgroundAnalysisOutputText,
  }),
);

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/parseSwiprBackgroundAnalysis", () => ({
  parseSwiprBackgroundAnalysis: mocks.parseSwiprBackgroundAnalysis,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest() {
  const formData = new FormData();

  formData.set("file", new File(["image"], "studio.jpg", {
    type: "image/jpeg",
  }));
  formData.set("originalName", "studio.jpg");

  return new Request(
    "https://clipstitchr.test/api/swipr/backgrounds/analyze",
    {
      body: formData,
      method: "POST",
    },
  );
}

describe("POST /api/swipr/backgrounds/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.createSwiprBackgroundAnalysisOutputText.mockResolvedValue(
      "analysis output",
    );
    mocks.parseSwiprBackgroundAnalysis.mockReturnValue({
      description: "Clean studio",
      name: "Studio",
      tags: ["studio"],
    });
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("consumes analysis quota, calls the provider parser, and returns structured metadata", async () => {
    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      description: "Clean studio",
      name: "Studio",
      tags: ["studio"],
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeSwiprBackgroundAnalyze,
      { secret: "rate-limit-secret" },
    );
    expect(mocks.createSwiprBackgroundAnalysisOutputText).toHaveBeenCalledWith(
      expect.objectContaining({
        originalName: "studio.jpg",
        replicate: { provider: "replicate" },
      }),
    );
    expect(mocks.parseSwiprBackgroundAnalysis).toHaveBeenCalledWith(
      "analysis output",
      "studio.jpg",
    );
  });

  it("returns provider and rate-limit failures", async () => {
    mocks.createSwiprBackgroundAnalysisOutputText.mockRejectedValueOnce(
      new Error("provider failed"),
    );

    const failedResponse = await POST(createRequest());

    await expect(failedResponse.json()).resolves.toEqual({
      message: "provider failed",
    });
    expect(failedResponse.status).toBe(500);

    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "swiprBackgroundAnalyze",
        retryAfter: 1000,
      },
    });

    const rateLimitResponse = await POST(createRequest());

    expect(rateLimitResponse.status).toBe(429);
  });
});
