import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/swapr/output/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    fetchReplicateOutput: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeSwaprOutputDownload: "rateLimits.consumeSwaprOutputDownload",
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

vi.mock("@/lib/clipstitchr/server/fetchReplicateOutput", () => ({
  fetchReplicateOutput: mocks.fetchReplicateOutput,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest(url = "https://clipstitchr.test/api/swapr/output?id=prediction_1&url=https%3A%2F%2Freplicate.example%2Foutput.mp4") {
  return new NextRequest(url);
}

describe("GET /api/swapr/output", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.fetchReplicateOutput.mockResolvedValue(
      new Response("video", {
        headers: {
          "content-length": "5",
          "content-type": "video/mp4",
        },
      }),
    );
  });

  it("returns 401 before parsing when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await GET(createRequest());

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("downloads a Swapr output after rate limiting", async () => {
    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("video");
    expect(response.headers.get("content-type")).toBe("video/mp4");
    expect(response.headers.get("content-length")).toBe("5");
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeSwaprOutputDownload,
      {
        outputUrl: "https://replicate.example/output.mp4",
        predictionId: "prediction_1",
        secret: "rate-limit-secret",
      },
    );
  });

  it("returns errors for missing IDs and rate limits", async () => {
    const missingResponse = await GET(
      createRequest("https://clipstitchr.test/api/swapr/output?url=x"),
    );

    await expect(missingResponse.json()).resolves.toEqual({
      message: "Missing Swapr prediction ID.",
    });
    expect(missingResponse.status).toBe(500);

    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "swaprOutput",
        retryAfter: 1000,
      },
    });

    const rateLimitResponse = await GET(createRequest());

    expect(rateLimitResponse.status).toBe(429);
  });
});
