import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/video-clips/score/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createFileFromR2Object: vi.fn(),
    createQuickEditDetectorCandidates: vi.fn(),
    createReplicateClient: vi.fn(() => ({ provider: "replicate" })),
    createUploadVideoAnalysisOutputText: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    getR2DownloadSignedUrl: vi.fn(),
    parseUploadAssetAnalysis: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeUploadVideoAnalysis: "rateLimits.consumeUploadVideoAnalysis",
    },
    videoClips: {
      get: "videoClips.get",
      updatePerformanceScore: "videoClips.updatePerformanceScore",
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

vi.mock("@/lib/clipstitchr/server/r2/createFileFromR2Object", () => ({
  createFileFromR2Object: mocks.createFileFromR2Object,
}));

vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getR2DownloadSignedUrl,
}));

function createRequest(clipId = "clip_1") {
  return new Request("https://clipstitchr.test/api/video-clips/score", {
    body: JSON.stringify({ clipId }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

function createClip(overrides: Record<string, unknown> = {}) {
  return {
    clipType: "ugc",
    duration: 12,
    id: "clip_1",
    libraryKind: "ugc",
    name: "UGC Clip",
    originalName: "ugc.mp4",
    posterObject: {
      contentType: "image/jpeg",
      key: "users/user_123/clips/clip_1/poster.jpg",
      size: 42,
    },
    videoObject: {
      contentType: "video/mp4",
      key: "users/user_123/clips/clip_1/video.mp4",
      size: 100,
    },
    ...overrides,
  };
}

describe("POST /api/video-clips/score", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.convex.query.mockResolvedValue(createClip());
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      expiresIn: 60,
      url: "https://r2.example/video.mp4",
    });
    mocks.createFileFromR2Object.mockResolvedValue(
      new File(["poster"], "poster.jpg", { type: "image/jpeg" }),
    );
    mocks.createQuickEditDetectorCandidates.mockResolvedValue([
      {
        start: 2,
        end: 4,
        confidence: 0.82,
        signals: ["silence", "long-pause"],
      },
    ]);
    mocks.createUploadVideoAnalysisOutputText.mockResolvedValue("video output");
    mocks.parseUploadAssetAnalysis.mockReturnValue({
      performanceScore: {
        bestUse: "Use as the opener",
        fixes: ["Trim the pause"],
        overall: 86,
        strengths: ["Clear hook"],
        summary: "Strong opener.",
      },
    });
  });

  it("scores and saves an authenticated UGC clip", async () => {
    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      performanceScore: expect.objectContaining({
        overall: 86,
      }),
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeUploadVideoAnalysis,
      { secret: "rate-limit-secret" },
    );
    expect(mocks.getR2DownloadSignedUrl).toHaveBeenCalledWith(
      "users/user_123/clips/clip_1/video.mp4",
    );
    expect(mocks.createUploadVideoAnalysisOutputText).toHaveBeenCalledWith(
      expect.objectContaining({
        fallbackImageFile: expect.any(File),
        detectorCandidates: [
          {
            start: 2,
            end: 4,
            confidence: 0.82,
            signals: ["silence", "long-pause"],
          },
        ],
        mediaKind: "ugc-video",
        originalName: "ugc.mp4",
        sourceSizeBytes: 100,
        sourceUrl: "https://r2.example/video.mp4",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.videoClips.updatePerformanceScore,
      expect.objectContaining({
        id: "clip_1",
        performanceScore: expect.objectContaining({ overall: 86 }),
        updatedAt: expect.any(String),
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.videoClips.updatePerformanceScore,
      expect.objectContaining({
        performanceScore: expect.objectContaining({
          quickEditSuggestions: expect.objectContaining({
            candidates: [
              {
                start: 2,
                end: 4,
                confidence: 0.82,
                signals: ["silence", "long-pause"],
              },
            ],
            removeRanges: [],
          }),
        }),
      }),
    );
  });

  it("scores demo clips with the demo analysis prompt", async () => {
    mocks.convex.query.mockResolvedValueOnce(
      createClip({
        clipType: "demo",
        libraryKind: "demo",
        originalName: "demo.mp4",
      }),
    );

    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    expect(mocks.createUploadVideoAnalysisOutputText).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaKind: "demo-video",
        originalName: "demo.mp4",
      }),
    );
  });

  it("keeps scoring when the poster fallback is unavailable", async () => {
    mocks.createFileFromR2Object.mockRejectedValueOnce(
      new Error("Poster unavailable"),
    );

    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    expect(mocks.createUploadVideoAnalysisOutputText).toHaveBeenCalledWith(
      expect.objectContaining({
        fallbackImageFile: undefined,
        sourceUrl: "https://r2.example/video.mp4",
      }),
    );
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("returns 404 when the clip is missing", async () => {
    mocks.convex.query.mockResolvedValueOnce(null);

    const response = await POST(createRequest("missing"));

    expect(response.status).toBe(404);
  });

  it("rejects swaps before quota or provider work", async () => {
    mocks.convex.query.mockResolvedValueOnce(
      createClip({
        libraryKind: "swapr",
        swaprMetadata: { source: "swapr" },
      }),
    );

    const response = await POST(createRequest());

    expect(response.status).toBe(400);
    expect(mocks.convex.mutation).not.toHaveBeenCalled();
    expect(mocks.createUploadVideoAnalysisOutputText).not.toHaveBeenCalled();
  });

  it("returns rate-limit errors before provider work", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "uploadVideoAnalysis",
        retryAfter: 1000,
      },
    });

    const response = await POST(createRequest());

    expect(response.status).toBe(429);
    expect(mocks.createUploadVideoAnalysisOutputText).not.toHaveBeenCalled();
  });
});
