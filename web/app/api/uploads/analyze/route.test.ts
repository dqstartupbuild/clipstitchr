import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/uploads/analyze/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = { mutation: vi.fn() };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createQuickEditDetectorCandidates: vi.fn(),
    createReplicateClient: vi.fn(() => ({ provider: "replicate" })),
    createUploadImageAnalysisOutputText: vi.fn(),
    createUploadVideoAnalysisOutputText: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    parseUploadAssetAnalysis: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeUploadAnalysis: "rateLimits.consumeUploadAnalysis",
      consumeUploadVideoAnalysis: "rateLimits.consumeUploadVideoAnalysis",
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

vi.mock("@/lib/clipstitchr/server/createQuickEditDetectorCandidates", () => ({
  createQuickEditDetectorCandidates: mocks.createQuickEditDetectorCandidates,
}));

vi.mock("@/lib/clipstitchr/server/createUploadImageAnalysisOutputText", () => ({
  createUploadImageAnalysisOutputText: mocks.createUploadImageAnalysisOutputText,
}));

vi.mock("@/lib/clipstitchr/server/createUploadVideoAnalysisOutputText", () => ({
  createUploadVideoAnalysisOutputText: mocks.createUploadVideoAnalysisOutputText,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/parseUploadAssetAnalysis", () => ({
  parseUploadAssetAnalysis: mocks.parseUploadAssetAnalysis,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest(kind = "ugc-video") {
  const formData = new FormData();

  formData.set("fallbackImage", new File(["poster"], "poster.jpg", {
    type: "image/jpeg",
  }));
  formData.set("file", new File(["video"], "clip.mp4", { type: "video/mp4" }));
  formData.set("mediaKind", kind);
  formData.set("originalName", "clip.mp4");
  formData.set("sourceSizeBytes", "42");
  formData.set("sourceUrl", "https://r2.example/clip.mp4");

  return new Request("https://clipstitchr.test/api/uploads/analyze", {
    body: formData,
    method: "POST",
  });
}

describe("POST /api/uploads/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.createQuickEditDetectorCandidates.mockResolvedValue([
      {
        start: 1,
        end: 3,
        confidence: 0.8,
        signals: ["static-frame"],
      },
    ]);
    mocks.createUploadVideoAnalysisOutputText.mockResolvedValue("video output");
    mocks.createUploadImageAnalysisOutputText.mockResolvedValue("image output");
    mocks.parseUploadAssetAnalysis.mockReturnValue({
      name: "Analyzed clip",
      tags: ["ugc"],
    });
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("analyzes video uploads with the video quota", async () => {
    const response = await POST(createRequest("ugc-video"));

    await expect(response.json()).resolves.toEqual({
      name: "Analyzed clip",
      tags: ["ugc"],
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeUploadVideoAnalysis,
      { secret: "rate-limit-secret" },
    );
    expect(mocks.createUploadVideoAnalysisOutputText).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaKind: "ugc-video",
        detectorCandidates: [
          {
            start: 1,
            end: 3,
            confidence: 0.8,
            signals: ["static-frame"],
          },
        ],
        originalName: "clip.mp4",
        sourceSizeBytes: 42,
        sourceUrl: "https://r2.example/clip.mp4",
      }),
    );
  });

  it("analyzes image uploads and returns rate-limit errors", async () => {
    const imageResponse = await POST(createRequest("photo"));

    expect(imageResponse.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeUploadAnalysis,
      { secret: "rate-limit-secret" },
    );
    expect(mocks.createUploadImageAnalysisOutputText).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaKind: "photo",
        originalName: "clip.mp4",
      }),
    );

    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "uploadAnalysis",
        retryAfter: 1000,
      },
    });

    const rateLimitResponse = await POST(createRequest("photo"));

    expect(rateLimitResponse.status).toBe(429);
  });
});
