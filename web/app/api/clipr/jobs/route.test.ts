import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/clipr/jobs/route";
import { api } from "@/convex/_generated/api";

const imageBody = new Uint8Array([1, 2, 3]).buffer;
const videoBody = new Uint8Array([4, 5, 6, 7]).buffer;
const musicBody = new Uint8Array([8, 9]).buffer;

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    capturePostHogServerEvent: vi.fn(),
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    createCliprAvatarVideo: vi.fn(),
    createCliprMusic: vi.fn(),
    createCliprSceneAvatarImage: vi.fn(),
    createCliprTextGeneration: vi.fn(),
    createId: vi.fn(),
    createReplicateClient: vi.fn(() => ({ provider: "replicate" })),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
    getCliprAvatarSourceScene: vi.fn(),
    getR2DownloadSignedUrl: vi.fn(),
    saveCliprAvatarVideoObject: vi.fn(),
    saveCliprGeneratedAvatarPhoto: vi.fn(),
    saveCliprMusicObject: vi.fn(),
    saveCliprSceneImageObject: vi.fn(),
    saveSharedMusicObject: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    avatars: {
      get: "avatars.get",
    },
    cliprJobs: {
      applyScriptPlan: "cliprJobs.applyScriptPlan",
      createQueued: "cliprJobs.createQueued",
      fail: "cliprJobs.fail",
      recordAvatarImageOutput: "cliprJobs.recordAvatarImageOutput",
      recordAvatarVideoOutput: "cliprJobs.recordAvatarVideoOutput",
    },
    photoAssets: {
      getFirstForAvatar: "photoAssets.getFirstForAvatar",
    },
    products: {
      get: "products.get",
    },
    rateLimits: {
      consumeCliprAvatarStillGeneration:
        "rateLimits.consumeCliprAvatarStillGeneration",
      consumeCliprHookScript: "rateLimits.consumeCliprHookScript",
      consumeCliprJobCreate: "rateLimits.consumeCliprJobCreate",
      consumeCliprMusicGeneration: "rateLimits.consumeCliprMusicGeneration",
      consumeCliprVoiceGeneration: "rateLimits.consumeCliprVoiceGeneration",
      consumeR2Upload: "rateLimits.consumeR2Upload",
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

vi.mock("@/lib/clipstitchr/server/createCliprAvatarVideo", () => ({
  createCliprAvatarVideo: mocks.createCliprAvatarVideo,
}));

vi.mock("@/lib/clipstitchr/server/createCliprMusic", () => ({
  createCliprMusic: mocks.createCliprMusic,
}));

vi.mock("@/lib/clipstitchr/server/createCliprSceneAvatarImage", () => ({
  createCliprSceneAvatarImage: mocks.createCliprSceneAvatarImage,
}));

vi.mock("@/lib/clipstitchr/server/createCliprTextGeneration", () => ({
  createCliprTextGeneration: mocks.createCliprTextGeneration,
}));

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/getCliprAvatarSourceScene", () => ({
  getCliprAvatarSourceScene: mocks.getCliprAvatarSourceScene,
}));

vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getR2DownloadSignedUrl,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

vi.mock("@/lib/clipstitchr/server/saveCliprAvatarVideoObject", () => ({
  saveCliprAvatarVideoObject: mocks.saveCliprAvatarVideoObject,
}));

vi.mock("@/lib/clipstitchr/server/saveCliprGeneratedAvatarPhoto", () => ({
  saveCliprGeneratedAvatarPhoto: mocks.saveCliprGeneratedAvatarPhoto,
}));

vi.mock("@/lib/clipstitchr/server/saveCliprMusicObject", () => ({
  saveCliprMusicObject: mocks.saveCliprMusicObject,
}));

vi.mock("@/lib/clipstitchr/server/saveCliprSceneImageObject", () => ({
  saveCliprSceneImageObject: mocks.saveCliprSceneImageObject,
}));

vi.mock("@/lib/clipstitchr/server/saveSharedMusicObject", () => ({
  saveSharedMusicObject: mocks.saveSharedMusicObject,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createRequest(body: Record<string, unknown> = {}) {
  return new Request("https://clipstitchr.test/api/clipr/jobs", {
    body: JSON.stringify({
      addMusic: true,
      avatarId: " avatar_1 ",
      durationSeconds: 30,
      jobId: " job_1 ",
      productId: " product_1 ",
      voiceId: "Zephyr (Female)",
      ...body,
    }),
    method: "POST",
  });
}

function createProductDocument() {
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

function createAvatarDocument() {
  return {
    description: "Confident founder",
    id: "avatar_1",
    name: "Founder",
  };
}

function createPhotoDocument() {
  return {
    id: "photo_1",
    photoObject: {
      contentType: "image/jpeg",
      key: "users/user_123/photos/photo_1.jpg",
      size: 20,
    },
  };
}

function createTextGeneration() {
  return {
    filledHook: "Stop wasting launch time",
    hookStyleKey: "direct_diagnosis",
    hookTemplateId: "APP-001",
    providerModel: "text-model",
    scenePlan: [
      {
        id: "scene_1",
        scriptText: "Try this",
        visualPrompt: "Creator in studio",
      },
    ],
    script: "Try this product today.",
    variablesUsed: { product: "Launch Kit" },
  };
}

describe("POST /api/clipr/jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
    mocks.createId
      .mockReset()
      .mockReturnValueOnce("generated_photo_1")
      .mockReturnValueOnce("track_1")
      .mockReturnValue("next_id");
    mocks.convex.query.mockImplementation((queryId: string) => {
      if (queryId === "products.get") {
        return Promise.resolve(createProductDocument());
      }

      if (queryId === "avatars.get") {
        return Promise.resolve(createAvatarDocument());
      }

      if (queryId === "photoAssets.getFirstForAvatar") {
        return Promise.resolve(createPhotoDocument());
      }

      if (queryId === "sharedMusicTracks.get") {
        return Promise.resolve({
          audioObject: {
            contentType: "audio/mpeg",
            key: "shared/music/track_1.mp3",
            size: 20,
          },
          durationSeconds: 30,
          id: "track_1",
          title: "Shared music",
          volume: 1,
        });
      }

      return Promise.resolve(null);
    });
    mocks.convex.mutation.mockImplementation((mutationId: string) => {
      if (mutationId === "cliprJobs.recordAvatarVideoOutput") {
        return Promise.resolve({
          id: "job_1",
          status: "ready-to-save",
        });
      }

      return Promise.resolve(null);
    });
    mocks.createCliprTextGeneration.mockResolvedValue(createTextGeneration());
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      url: "https://r2.example/photo.jpg",
    });
    mocks.getCliprAvatarSourceScene.mockReturnValue({
      id: "scene_1",
      scriptText: "Try this",
      visualPrompt: "Creator in studio",
    });
    mocks.createCliprSceneAvatarImage.mockResolvedValue({
      body: imageBody,
      contentType: "image/jpeg",
      modelId: "image-model",
      outputUrl: "https://replicate.example/avatar.jpg",
      predictionId: "image_prediction",
    });
    mocks.saveCliprSceneImageObject.mockResolvedValue({
      contentType: "image/jpeg",
      key: "users/user_123/clipr/job_1/avatar.jpg",
      size: 3,
    });
    mocks.saveCliprGeneratedAvatarPhoto.mockResolvedValue(null);
    mocks.createCliprAvatarVideo.mockResolvedValue({
      body: videoBody,
      contentType: "video/mp4",
      modelId: "video-model",
      predictionId: "video_prediction",
    });
    mocks.createCliprMusic.mockResolvedValue({
      body: musicBody,
      contentType: "audio/mpeg",
      durationSeconds: 30,
      modelId: "music-model",
      predictionId: "music_prediction",
      prompt: "upbeat launch music",
    });
    mocks.saveCliprAvatarVideoObject.mockResolvedValue({
      contentType: "video/mp4",
      key: "users/user_123/clipr/job_1/video.mp4",
      size: 4,
    });
    mocks.saveCliprMusicObject.mockResolvedValue({
      contentType: "audio/mpeg",
      key: "users/user_123/clipr/job_1-track_1.mp3",
      size: 2,
    });
    mocks.saveSharedMusicObject.mockResolvedValue({
      contentType: "audio/mpeg",
      key: "shared/music/track_1.mp3",
      size: 2,
    });
  });

  it("returns 401 before token creation when authentication is missing", async () => {
    mocks.getAuthenticatedUserId.mockResolvedValue(null);

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
    });
    expect(response.status).toBe(401);
    expect(mocks.getAuthenticatedConvexToken).not.toHaveBeenCalled();
  });

  it("returns 500 when the Convex token cannot be created", async () => {
    mocks.getAuthenticatedConvexToken.mockResolvedValue(null);

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      message: "Unable to create a Convex auth token.",
    });
    expect(response.status).toBe(500);
    expect(mocks.createAuthenticatedConvexHttpClient).not.toHaveBeenCalled();
  });

  it("creates a queued Clipr job through text, image, video, music, R2, and Convex persistence", async () => {
    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      job: {
        id: "job_1",
        status: "ready-to-save",
      },
    });
    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeCliprJobCreate,
      {
        estimatedSeconds: 30,
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.cliprJobs.createQueued,
      expect.objectContaining({
        avatarId: "avatar_1",
        id: "job_1",
        productId: "product_1",
        productName: "Launch Kit",
      }),
    );
    expect(mocks.createCliprTextGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        durationSeconds: 30,
        product: expect.objectContaining({ name: "Launch Kit" }),
        purpose: "clipr",
        slideCount: 4,
      }),
    );
    expect(mocks.createCliprSceneAvatarImage).toHaveBeenCalledWith({
      avatarDescription: "Confident founder",
      referenceImageUrl: "https://r2.example/photo.jpg",
      replicate: { provider: "replicate" },
      scene: expect.objectContaining({ id: "scene_1" }),
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeCliprMusicGeneration,
      expect.objectContaining({ secret: "rate-limit-secret" }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.sharedMusicTracks.save,
      expect.objectContaining({
        id: "track_1",
        ownerAudioObject: expect.objectContaining({
          key: "users/user_123/clipr/job_1-track_1.mp3",
        }),
        source: "clipr",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.cliprJobs.recordAvatarVideoOutput,
      expect.objectContaining({
        avatarVideoProviderPredictionId: "video_prediction",
        id: "job_1",
        music: expect.objectContaining({
          providerPredictionId: "music_prediction",
          sharedTrackId: "track_1",
        }),
        providerModels: ["video-model", "music-model"],
      }),
    );
    expect(mocks.capturePostHogServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        distinctId: "user_123",
        event: "clipr_job_created",
        properties: expect.objectContaining({
          has_music: true,
          job_id: "job_1",
        }),
      }),
    );
  });

  it("uses a selected shared music track without generating new music", async () => {
    const response = await POST(
      createRequest({
        addMusic: true,
        musicTrackId: " track_1 ",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.createCliprMusic).not.toHaveBeenCalled();
    expect(mocks.saveCliprMusicObject).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.cliprJobs.recordAvatarVideoOutput,
      expect.objectContaining({
        music: expect.objectContaining({
          sharedTrackId: "track_1",
          title: "Shared music",
        }),
        providerModels: ["video-model"],
      }),
    );
  });

  it("fails the job and returns validation errors", async () => {
    const response = await POST(createRequest({ productId: " " }));

    await expect(response.json()).resolves.toEqual({
      message: "Choose a saved product first.",
    });
    expect(response.status).toBe(500);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.cliprJobs.fail,
      expect.objectContaining({
        error: "Choose a saved product first.",
        id: "job_1",
      }),
    );
    expect(mocks.capturePostHogServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "clipr_job_failed",
      }),
    );
  });

  it("returns 429 and records failure when job-create quota is exceeded", async () => {
    mocks.convex.mutation.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "cliprJobCreate",
        retryAfter: 2000,
      },
    });

    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        rateLimit: "cliprJobCreate",
        retryAfterSeconds: 2,
      }),
    );
    expect(response.status).toBe(429);
    expect(mocks.createCliprTextGeneration).not.toHaveBeenCalled();
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.cliprJobs.fail,
      expect.objectContaining({ id: "job_1" }),
    );
  });
});
