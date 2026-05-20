import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/music/generate/route";
import { api } from "@/convex/_generated/api";

const generatedBody = new Uint8Array([1, 2, 3]).buffer;

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    capturePostHogServerEvent: vi.fn(),
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createId: vi.fn(),
    createLibraryMusic: vi.fn(),
    createReplicateClient: vi.fn(() => ({ provider: "replicate" })),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    saveLibraryMusicObject: vi.fn(),
    saveSharedMusicObject: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeR2Upload: "rateLimits.consumeR2Upload",
      consumeSharedMusicGeneration: "rateLimits.consumeSharedMusicGeneration",
    },
    sharedMusicTracks: {
      get: "sharedMusicTracks.get",
      save: "sharedMusicTracks.save",
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/analytics/capturePostHogServerEvent", () => ({
  capturePostHogServerEvent: mocks.capturePostHogServerEvent,
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

vi.mock("@/lib/clipstitchr/server/createLibraryMusic", () => ({
  createLibraryMusic: mocks.createLibraryMusic,
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

vi.mock("@/lib/clipstitchr/server/saveLibraryMusicObject", () => ({
  saveLibraryMusicObject: mocks.saveLibraryMusicObject,
}));

vi.mock("@/lib/clipstitchr/server/saveSharedMusicObject", () => ({
  saveSharedMusicObject: mocks.saveSharedMusicObject,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createRequest(body: object) {
  return new Request("https://clipstitchr.test/api/music/generate", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

describe("POST /api/music/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.convex.query.mockResolvedValue({
      id: "track_1",
      title: "Generated music",
    });
    mocks.createId.mockReturnValue("track_1");
    mocks.createLibraryMusic.mockResolvedValue({
      body: generatedBody,
      contentType: "audio/mpeg",
      durationSeconds: 30,
      modelId: "music-model",
      predictionId: "prediction_1",
      prompt: "upbeat synth music",
    });
    mocks.saveSharedMusicObject.mockResolvedValue({
      contentType: "audio/mpeg",
      key: "shared/music/track_1.mp3",
      size: 3,
    });
    mocks.saveLibraryMusicObject.mockResolvedValue({
      contentType: "audio/mpeg",
      key: "users/user_123/music/track_1.mp3",
      size: 3,
    });
  });

  it("returns 401 before consuming quota when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest({ source: "library" }));

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
    expect(mocks.createLibraryMusic).not.toHaveBeenCalled();
  });

  it("generates, stores, and records a shared music track", async () => {
    const response = await POST(
      createRequest({
        source: "swipr",
        style: " launch campaign ".repeat(30),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      track: {
        id: "track_1",
        title: "Generated music",
      },
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeSharedMusicGeneration,
      expect.objectContaining({ secret: "rate-limit-secret" }),
    );
    expect(mocks.createLibraryMusic).toHaveBeenCalledWith({
      replicate: { provider: "replicate" },
      style: expect.stringMatching(/^launch campaign/),
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeR2Upload,
      {
        secret: "rate-limit-secret",
        sizeBytes: 6,
      },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.sharedMusicTracks.save,
      expect.objectContaining({
        id: "track_1",
        mimeType: "audio/mpeg",
        providerModel: "music-model",
        providerPredictionId: "prediction_1",
        source: "swipr",
      }),
    );
    expect(mocks.convex.query).toHaveBeenCalledWith(api.sharedMusicTracks.get, {
      id: "track_1",
    });
    expect(mocks.capturePostHogServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        distinctId: "user_123",
        event: "library_music_generated",
      }),
    );
  });

  it("defaults unknown sources to library", async () => {
    await POST(createRequest({ source: "unknown", style: "" }));

    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.sharedMusicTracks.save,
      expect.objectContaining({
        source: "library",
        style: undefined,
      }),
    );
  });

  it("returns 429 before provider work when music quota is exceeded", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "sharedMusicGeneration",
        retryAfter: 2200,
      },
    });

    const response = await POST(createRequest({ source: "library" }));

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "sharedMusicGeneration",
        retryAfterSeconds: 3,
      }),
    );
    expect(response.status).toBe(429);
    expect(mocks.createLibraryMusic).not.toHaveBeenCalled();
  });
});
