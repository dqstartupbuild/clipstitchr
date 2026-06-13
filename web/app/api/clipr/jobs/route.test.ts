import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/clipr/jobs/route";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
    query: vi.fn(),
  };

  return {
    capturePostHogServerEvent: vi.fn(),
    convex,
    createAuthenticatedConvexHttpClient: vi.fn(() => convex),
    getAuthenticatedConvexToken: vi.fn(),
    getAuthenticatedUserId: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    avatars: {
      get: "avatars.get",
    },
    cliprJobs: {
      createQueued: "cliprJobs.createQueued",
      fail: "cliprJobs.fail",
    },
    photoAssets: {
      getFirstForAvatar: "photoAssets.getFirstForAvatar",
    },
    products: {
      get: "products.get",
    },
    providerJobs: {
      create: "providerJobs.create",
    },
    rateLimits: {
      consumeCliprAvatarStillGeneration:
        "rateLimits.consumeCliprAvatarStillGeneration",
      consumeCliprHookScript: "rateLimits.consumeCliprHookScript",
      consumeCliprJobCreate: "rateLimits.consumeCliprJobCreate",
      consumeCliprMusicGeneration: "rateLimits.consumeCliprMusicGeneration",
      consumeCliprVideoGeneration: "rateLimits.consumeCliprVideoGeneration",
      consumeCliprVoiceGeneration: "rateLimits.consumeCliprVoiceGeneration",
    },
    sharedMusicTracks: {
      get: "sharedMusicTracks.get",
    },
    videoClips: {
      get: "videoClips.get",
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

vi.mock("@/lib/clipstitchr/server/getAuthenticatedUserId", () => ({
  getAuthenticatedUserId: mocks.getAuthenticatedUserId,
}));

vi.mock("@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret", () => ({
  getRateLimitApiSecret: () => "rate-limit-secret",
}));

function createRequest(body: Record<string, unknown> = {}) {
  return new Request("https://clipstitchr.test/api/clipr/jobs", {
    body: JSON.stringify({
      addMusic: true,
      avatarId: " avatar_1 ",
      avatarSceneLocation: " gym mirror ",
      avatarSceneOutfit: " black workout set ",
      avatarScenePose: " taking a progress photo ",
      durationSeconds: 30,
      jobId: " job_1 ",
      productId: " product_1 ",
      voiceId: "Rachel",
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

function createDemoClipDocument() {
  return {
    clipType: "demo",
    id: "demo_1",
    name: "Phone screen demo",
    videoDescription: "A short screen recording of the onboarding flow.",
    videoObject: {
      contentType: "video/mp4",
      key: "users/user_123/demos/demo_1.mp4",
      size: 200,
    },
  };
}

describe("POST /api/clipr/jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CLIPR_VISUAL_VIDEO_MODEL_ID;
    mocks.getAuthenticatedUserId.mockResolvedValue("user_123");
    mocks.getAuthenticatedConvexToken.mockResolvedValue("convex-token");
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
        return Promise.resolve(null);
      }

      if (queryId === "videoClips.get") {
        return Promise.resolve(createDemoClipDocument());
      }

      return Promise.resolve(null);
    });
    mocks.convex.mutation.mockImplementation((mutationId: string) => {
      if (mutationId === "cliprJobs.createQueued") {
        return Promise.resolve({
          id: "job_1",
          status: "scripting",
        });
      }

      if (mutationId === "providerJobs.create") {
        return Promise.resolve({
          id: "provider:clipr:job_1",
          status: "queued",
        });
      }

      return Promise.resolve(null);
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

  it("creates a queued Clipr job and durable provider job", async () => {
    const response = await POST(createRequest());

    await expect(response.json()).resolves.toEqual({
      job: {
        id: "job_1",
        status: "scripting",
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
      api.rateLimits.consumeCliprVoiceGeneration,
      {
        estimatedSeconds: 30,
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeCliprVideoGeneration,
      {
        estimatedSeconds: 30,
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeCliprAvatarStillGeneration,
      {
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeCliprMusicGeneration,
      expect.objectContaining({ secret: "rate-limit-secret" }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.cliprJobs.createQueued,
      expect.objectContaining({
        avatarId: "avatar_1",
        generationMode: "script",
        id: "job_1",
        productId: "product_1",
        productName: "Launch Kit",
        requestedGenerationMode: "any",
        requestedVideoModelId: "auto",
        videoModelId: "prunaai/p-video-avatar",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.providerJobs.create,
      expect.objectContaining({
        id: "provider:clipr:job_1",
        jobType: "manual-clipr",
        ownerId: "user_123",
      }),
    );
    expect(mocks.capturePostHogServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        distinctId: "user_123",
        event: "clipr_job_created",
      }),
    );
  });

  it("trims script ideas before saving the job and provider snapshot", async () => {
    const response = await POST(
      createRequest({
        scriptIdea: "  Make this a story about a launch content mistake.  ",
      }),
    );
    const createQueuedCall = mocks.convex.mutation.mock.calls.find(
      ([mutationId]) => mutationId === api.cliprJobs.createQueued,
    );
    const providerJobCreateCall = mocks.convex.mutation.mock.calls.find(
      ([mutationId]) => mutationId === api.providerJobs.create,
    );
    expect(createQueuedCall).toBeDefined();
    expect(providerJobCreateCall).toBeDefined();
    const providerJobInput = JSON.parse(
      providerJobCreateCall?.[1].inputSnapshotJson ?? "{}",
    ) as {
      avatarSceneLocation?: string;
      avatarSceneOutfit?: string;
      avatarScenePose?: string;
      lipSyncModelId?: string;
      generationMode?: string;
      scriptIdea?: string;
      ttsModelId?: string;
      videoModelId?: string;
    };

    expect(response.status).toBe(200);
    expect(createQueuedCall?.[1]).toEqual(
      expect.objectContaining({
        scriptIdea: "Make this a story about a launch content mistake.",
      }),
    );
    expect(providerJobInput.scriptIdea).toBe(
      "Make this a story about a launch content mistake.",
    );
    expect(providerJobInput.avatarSceneLocation).toBe("gym mirror");
    expect(providerJobInput.avatarSceneOutfit).toBe("black workout set");
    expect(providerJobInput.avatarScenePose).toBe("taking a progress photo");
    expect(providerJobInput.ttsModelId).toBe("elevenlabs/v3");
    expect(providerJobInput.lipSyncModelId).toBe("pixverse/lipsync");
    expect(providerJobInput.generationMode).toBe("script");
    expect(providerJobInput.videoModelId).toBe("prunaai/p-video-avatar");
  });

  it("creates a silent reaction job without voice or music generation", async () => {
    const response = await POST(
      createRequest({
        addMusic: true,
        durationSeconds: 10,
        generationMode: "reaction",
        videoModelId: "google/veo-3.1",
      }),
    );
    const providerJobCreateCall = mocks.convex.mutation.mock.calls.find(
      ([mutationId]) => mutationId === api.providerJobs.create,
    );
    const providerJobInput = JSON.parse(
      providerJobCreateCall?.[1].inputSnapshotJson ?? "{}",
    ) as {
      addMusic?: boolean;
      durationSeconds?: number;
      generationMode?: string;
      musicTrack?: unknown;
      videoModelId?: string;
    };

    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeCliprJobCreate,
      {
        estimatedSeconds: 10,
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.rateLimits.consumeCliprVideoGeneration,
      {
        estimatedSeconds: 10,
        secret: "rate-limit-secret",
      },
    );
    expect(mocks.convex.mutation).not.toHaveBeenCalledWith(
      api.rateLimits.consumeCliprVoiceGeneration,
      expect.anything(),
    );
    expect(mocks.convex.mutation).not.toHaveBeenCalledWith(
      api.rateLimits.consumeCliprMusicGeneration,
      expect.anything(),
    );
    expect(providerJobInput.addMusic).toBe(false);
    expect(providerJobInput.durationSeconds).toBe(10);
    expect(providerJobInput.generationMode).toBe("reaction");
    expect(providerJobInput.musicTrack).toBeNull();
    expect(providerJobInput.videoModelId).toBe("kwaivgi/kling-v3-video");
  });

  it("creates a demo remix job from a selected demo video", async () => {
    const response = await POST(
      createRequest({
        addMusic: true,
        avatarId: "",
        demoClipId: " demo_1 ",
        durationSeconds: 8,
        generationMode: "demo",
      }),
    );
    const providerJobCreateCall = mocks.convex.mutation.mock.calls.find(
      ([mutationId]) => mutationId === api.providerJobs.create,
    );
    const providerJobInput = JSON.parse(
      providerJobCreateCall?.[1].inputSnapshotJson ?? "{}",
    ) as {
      avatarPhotoObject?: unknown;
      demoClipId?: string;
      demoClipName?: string;
      demoVideoObject?: { key?: string };
      durationSeconds?: number;
      generationMode?: string;
      videoModelId?: string;
    };

    expect(response.status).toBe(200);
    expect(mocks.convex.query).toHaveBeenCalledWith(api.videoClips.get, {
      id: "demo_1",
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.cliprJobs.createQueued,
      expect.objectContaining({
        avatarId: "",
        demoClipId: "demo_1",
        demoClipName: "Phone screen demo",
        generationMode: "demo",
        videoModelId: "bytedance/seedance-2.0",
      }),
    );
    expect(mocks.convex.mutation).not.toHaveBeenCalledWith(
      api.rateLimits.consumeCliprAvatarStillGeneration,
      expect.anything(),
    );
    expect(mocks.convex.mutation).not.toHaveBeenCalledWith(
      api.rateLimits.consumeCliprVoiceGeneration,
      expect.anything(),
    );
    expect(mocks.convex.mutation).not.toHaveBeenCalledWith(
      api.rateLimits.consumeCliprMusicGeneration,
      expect.anything(),
    );
    expect(providerJobInput.avatarPhotoObject).toBeUndefined();
    expect(providerJobInput.demoClipId).toBe("demo_1");
    expect(providerJobInput.demoClipName).toBe("Phone screen demo");
    expect(providerJobInput.demoVideoObject?.key).toBe(
      "users/user_123/demos/demo_1.mp4",
    );
    expect(providerJobInput.durationSeconds).toBe(8);
    expect(providerJobInput.generationMode).toBe("demo");
    expect(providerJobInput.videoModelId).toBe("bytedance/seedance-2.0");
  });

  it("uses a selected shared music track without consuming music generation", async () => {
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
        });
      }

      return Promise.resolve(null);
    });

    const response = await POST(
      createRequest({
        addMusic: true,
        musicTrackId: " track_1 ",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.convex.mutation).not.toHaveBeenCalledWith(
      api.rateLimits.consumeCliprMusicGeneration,
      expect.anything(),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.providerJobs.create,
      expect.objectContaining({
        inputSnapshotJson: expect.stringContaining("track_1"),
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
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.cliprJobs.fail,
      expect.objectContaining({ id: "job_1" }),
    );
  });
});
