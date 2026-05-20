import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/clipr/music/route";
import { api } from "@/convex/_generated/api";

const generatedBody = new Uint8Array([8, 9, 10, 11, 12]).buffer;

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createCliprMusic: vi.fn(),
    createId: vi.fn(),
    createReplicateClient: vi.fn(() => ({ provider: "replicate" })),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    saveCliprMusicObject: vi.fn(),
    saveSharedMusicObject: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    products: {
      get: "products.get",
    },
    rateLimits: {
      consumeCliprMusicGeneration: "rateLimits.consumeCliprMusicGeneration",
      consumeR2Upload: "rateLimits.consumeR2Upload",
    },
    sharedMusicTracks: {
      save: "sharedMusicTracks.save",
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

vi.mock("@/lib/clipstitchr/server/createCliprMusic", () => ({
  createCliprMusic: mocks.createCliprMusic,
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

vi.mock("@/lib/clipstitchr/server/saveCliprMusicObject", () => ({
  saveCliprMusicObject: mocks.saveCliprMusicObject,
}));

vi.mock("@/lib/clipstitchr/server/saveSharedMusicObject", () => ({
  saveSharedMusicObject: mocks.saveSharedMusicObject,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createRequest(body: object) {
  return new Request("https://clipstitchr.test/api/clipr/music", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

function createClip() {
  return {
    cliprMetadata: {
      jobId: "job_1",
      productId: "product_1",
      productName: "Fallback Product",
      script: "Clipr script",
    },
    id: "clip_1",
  };
}

function createProduct() {
  return {
    audienceDetails: "Founders",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: ["slow launch"],
    inferredProblem: "campaigns take too long",
    name: "Launch Kit",
    productDetails: "AI launch planner",
    updatedAt: "2026-05-20T00:00:00.000Z",
  };
}

describe("POST /api/clipr/music", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.query.mockImplementation((queryId: string) => {
      if (queryId === "videoClips.get") {
        return Promise.resolve(createClip());
      }

      return Promise.resolve(createProduct());
    });
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.createId.mockReturnValue("track_1");
    mocks.createCliprMusic.mockResolvedValue({
      body: generatedBody,
      contentType: "audio/mpeg",
      durationSeconds: 30,
      modelId: "music-model",
      predictionId: "prediction_1",
      prompt: "clipr music",
    });
    mocks.saveCliprMusicObject.mockResolvedValue({
      contentType: "audio/mpeg",
      key: "users/user_123/clipr/job_1-track_1.mp3",
      size: 5,
    });
    mocks.saveSharedMusicObject.mockResolvedValue({
      contentType: "audio/mpeg",
      key: "shared/music/track_1.mp3",
      size: 5,
    });
  });

  it("returns 401 before parsing when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest({ clipId: "clip_1" }));

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("generates and saves Clipr music using product context", async () => {
    const response = await POST(createRequest({ clipId: " clip_1 " }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.music).toEqual(
      expect.objectContaining({
        durationSeconds: 30,
        enabled: true,
        providerModel: "music-model",
        providerPredictionId: "prediction_1",
        sharedTrackId: "track_1",
      }),
    );
    expect(mocks.convex.query).toHaveBeenCalledWith(api.videoClips.get, {
      id: "clip_1",
    });
    expect(mocks.convex.query).toHaveBeenCalledWith(api.products.get, {
      id: "product_1",
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeCliprMusicGeneration,
      expect.objectContaining({ secret: "rate-limit-secret" }),
    );
    expect(mocks.createCliprMusic).toHaveBeenCalledWith({
      audienceDetails: "Founders",
      productName: "Launch Kit",
      replicate: { provider: "replicate" },
      script: "Clipr script",
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeR2Upload,
      {
        secret: "rate-limit-secret",
        sizeBytes: 10,
      },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.sharedMusicTracks.save,
      expect.objectContaining({
        id: "track_1",
        source: "clipr",
        style: "Launch Kit",
      }),
    );
  });

  it("falls back to clip metadata when product context is unavailable", async () => {
    mocks.convex.query.mockImplementation((queryId: string) => {
      if (queryId === "videoClips.get") {
        return Promise.resolve(createClip());
      }

      return Promise.resolve(null);
    });

    await POST(createRequest({ clipId: "clip_1" }));

    expect(mocks.createCliprMusic).toHaveBeenCalledWith(
      expect.objectContaining({
        audienceDetails: "",
        productName: "Fallback Product",
      }),
    );
  });

  it("returns a 500 response when the clip has no Clipr metadata", async () => {
    mocks.convex.query.mockResolvedValueOnce({ id: "clip_1" });

    const response = await POST(createRequest({ clipId: "clip_1" }));

    await expect(response.json()).resolves.toEqual({
      message: "Clipr clip not found.",
    });
    expect(response.status).toBe(500);
    expect(mocks.createCliprMusic).not.toHaveBeenCalled();
  });

  it("returns 429 when Clipr music quota is exceeded", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "cliprMusicGeneration",
        retryAfter: 3000,
      },
    });

    const response = await POST(createRequest({ clipId: "clip_1" }));

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "cliprMusicGeneration",
        retryAfterSeconds: 3,
      }),
    );
    expect(response.status).toBe(429);
    expect(mocks.createCliprMusic).not.toHaveBeenCalled();
  });
});
