import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/stitches/music/route";
import { api } from "@/convex/_generated/api";

const generatedBody = new Uint8Array([4, 5, 6, 7]).buffer;

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createId: vi.fn(),
    createReplicateClient: vi.fn(() => ({ provider: "replicate" })),
    createStitchMusic: vi.fn(),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    saveSharedMusicObject: vi.fn(),
    saveStitchMusicObject: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    rateLimits: {
      consumeR2Upload: "rateLimits.consumeR2Upload",
      consumeStitchMusicGeneration: "rateLimits.consumeStitchMusicGeneration",
    },
    sharedMusicTracks: {
      save: "sharedMusicTracks.save",
    },
    stitches: {
      get: "stitches.get",
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

vi.mock("@/lib/clipstitchr/server/createStitchMusic", () => ({
  createStitchMusic: mocks.createStitchMusic,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

vi.mock("@/lib/clipstitchr/server/saveSharedMusicObject", () => ({
  saveSharedMusicObject: mocks.saveSharedMusicObject,
}));

vi.mock("@/lib/clipstitchr/server/saveStitchMusicObject", () => ({
  saveStitchMusicObject: mocks.saveStitchMusicObject,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createRequest(body: object) {
  return new Request("https://clipstitchr.test/api/stitches/music", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

function createStitch() {
  return {
    duration: 15,
    id: "stitch_1",
    name: "Launch Stitch",
  };
}

describe("POST /api/stitches/music", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.convex.query.mockResolvedValue(createStitch());
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.createId.mockReturnValue("track_1");
    mocks.createStitchMusic.mockResolvedValue({
      body: generatedBody,
      contentType: "audio/mpeg",
      durationSeconds: 30,
      modelId: "music-model",
      predictionId: "prediction_1",
      prompt: "stitch music",
    });
    mocks.saveStitchMusicObject.mockResolvedValue({
      contentType: "audio/mpeg",
      key: "users/user_123/stitches/stitch_1-track_1.mp3",
      size: 4,
    });
    mocks.saveSharedMusicObject.mockResolvedValue({
      contentType: "audio/mpeg",
      key: "shared/music/track_1.mp3",
      size: 4,
    });
  });

  it("returns 401 before parsing when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest({ stitchId: "stitch_1" }));

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("generates and saves Stitchr music for a saved stitch", async () => {
    const response = await POST(createRequest({ stitchId: " stitch_1 " }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.music).toEqual(
      expect.objectContaining({
        audioObject: expect.objectContaining({
          key: "users/user_123/stitches/stitch_1-track_1.mp3",
        }),
        durationSeconds: 30,
        enabled: true,
        providerPredictionId: "prediction_1",
        sharedTrackId: "track_1",
        volume: 1,
      }),
    );
    expect(mocks.convex.query).toHaveBeenCalledWith(api.stitches.get, {
      id: "stitch_1",
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeStitchMusicGeneration,
      expect.objectContaining({ secret: "rate-limit-secret" }),
    );
    expect(mocks.createStitchMusic).toHaveBeenCalledWith({
      replicate: { provider: "replicate" },
      stitch: createStitch(),
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeR2Upload,
      {
        secret: "rate-limit-secret",
        sizeBytes: 8,
      },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.sharedMusicTracks.save,
      expect.objectContaining({
        id: "track_1",
        ownerAudioObject: expect.objectContaining({
          key: "users/user_123/stitches/stitch_1-track_1.mp3",
        }),
        source: "stitchr",
        style: "Launch Stitch",
      }),
    );
  });

  it("returns a 500 response for missing stitch ids", async () => {
    const response = await POST(createRequest({ stitchId: "  " }));

    await expect(response.json()).resolves.toEqual({
      message: "Choose a stitch first.",
    });
    expect(response.status).toBe(500);
    expect(mocks.convex.query).not.toHaveBeenCalled();
  });

  it("returns 429 when music generation quota is exceeded", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "stitchMusicGeneration",
        retryAfter: 1500,
      },
    });

    const response = await POST(createRequest({ stitchId: "stitch_1" }));

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "stitchMusicGeneration",
        retryAfterSeconds: 2,
      }),
    );
    expect(response.status).toBe(429);
    expect(mocks.createStitchMusic).not.toHaveBeenCalled();
  });
});
