import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/stitches/score/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createReplicateClient: vi.fn(() => ({ provider: "replicate" })),
    createStitchScoreOutputText: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeStitchScoreAnalysis: "rateLimits.consumeStitchScoreAnalysis",
    },
    stitches: {
      get: "stitches.get",
      updateScore: "stitches.updateScore",
    },
    videoClips: {
      get: "videoClips.get",
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

vi.mock("@/lib/clipstitchr/server/createStitchScoreOutputText", () => ({
  createStitchScoreOutputText: mocks.createStitchScoreOutputText,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest(stitchId = "stitch_1") {
  return new Request("https://clipstitchr.test/api/stitches/score", {
    body: JSON.stringify({ stitchId }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

describe("POST /api/stitches/score", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.convex.query.mockImplementation(async (query) => {
      if (query === api.stitches.get) {
        return {
          demoClipId: "demo_1",
          demoClipName: "Demo",
          duration: 12,
          id: "stitch_1",
          sequenceSegments: undefined,
          ugcClipId: "ugc_1",
          ugcClipName: "UGC",
        };
      }

      return {
        id: "ugc_1",
        videoObject: {
          contentType: "video/mp4",
          key: "users/user_123/ugc.mp4",
          size: 100,
        },
      };
    });
    mocks.createStitchScoreOutputText.mockResolvedValue(
      JSON.stringify({
        overallRetentionEstimate: 74,
        hookToDemoFlow: 80,
        summary: "The opener works but the demo can arrive faster.",
        dropOffRiskPoints: ["2-4s: demo starts late"],
        suggestedTrims: ["Cut the pause before the demo"],
        suggestedOverlayText: ["Wait for the demo"],
        suggestedOpeningLine: "Wait for the demo",
      }),
    );
  });

  it("scores and saves an authenticated stitch", async () => {
    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      stitchScore: expect.objectContaining({
        overallRetentionEstimate: 74,
      }),
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeStitchScoreAnalysis,
      { secret: "rate-limit-secret" },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.stitches.updateScore,
      expect.objectContaining({
        id: "stitch_1",
        stitchScore: expect.objectContaining({
          hookToDemoFlow: 80,
        }),
      }),
    );
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("returns 404 when the stitch is missing", async () => {
    mocks.convex.query.mockResolvedValueOnce(null);

    const response = await POST(createRequest("missing"));

    expect(response.status).toBe(404);
  });

  it("returns rate-limit errors before provider work", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "stitchScore",
        retryAfter: 1000,
      },
    });

    const response = await POST(createRequest());

    expect(response.status).toBe(429);
    expect(mocks.createStitchScoreOutputText).not.toHaveBeenCalled();
  });
});
