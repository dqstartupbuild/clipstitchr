import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { POST } from "./route";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
  };
  const replicate = {
    predictions: {
      create: vi.fn(),
    },
  };

  return {
    convex,
    createCliprSceneAvatarImage: vi.fn(),
    createCliprSyncedAvatarVideoOutput: vi.fn(),
    createCliprTextGeneration: vi.fn(),
    createConvexHttpClient: vi.fn(() => convex),
    createReplicateClient: vi.fn(() => replicate),
    getR2DownloadSignedUrl: vi.fn(),
    replicate,
    saveCliprSceneImageObject: vi.fn(),
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    automationTasks: {
      claimNext: "automationTasks.claimNext",
      markStatus: "automationTasks.markStatus",
    },
    cliprJobs: {
      applyScriptPlanFromAutomation:
        "cliprJobs.applyScriptPlanFromAutomation",
      createQueuedFromAutomation: "cliprJobs.createQueuedFromAutomation",
      failFromAutomation: "cliprJobs.failFromAutomation",
      recordAvatarImageOutputFromAutomation:
        "cliprJobs.recordAvatarImageOutputFromAutomation",
      recordAvatarVideoOutputFromAutomation:
        "cliprJobs.recordAvatarVideoOutputFromAutomation",
    },
    mediaJobs: {
      createCliprFinalizationFromAutomation:
        "mediaJobs.createCliprFinalizationFromAutomation",
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: mocks.createConvexHttpClient,
}));

vi.mock("@/lib/clipstitchr/server/createCliprSyncedAvatarVideoOutput", () => ({
  createCliprSyncedAvatarVideoOutput: mocks.createCliprSyncedAvatarVideoOutput,
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

vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getR2DownloadSignedUrl,
}));

vi.mock("@/lib/clipstitchr/server/saveCliprSceneImageObject", () => ({
  saveCliprSceneImageObject: mocks.saveCliprSceneImageObject,
}));

function createRequest(secret = "automation_secret", body: unknown = {}) {
  return new Request("http://localhost/api/automation/clipr/execute", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-automation-worker-secret": secret,
    },
    body: JSON.stringify(body),
  });
}

function createTask(overrides: Record<string, unknown> = {}) {
  return {
    id: "automation:clipr:owner_123:2026-05-31:1",
    inputSnapshotJson: JSON.stringify({
      addMusic: false,
      automationDate: "2026-05-31",
      productId: "product_1",
      productName: "Daily Product",
      productDetails: "Hydrating daily skincare serum",
      audienceDetails: "Busy creators who want simple routines",
      inferredProblem: "Dry skin",
      inferredPainPoints: ["looks dull on camera"],
      productCreatedAt: "2026-05-01T00:00:00.000Z",
      productUpdatedAt: "2026-05-02T00:00:00.000Z",
      avatarId: "avatar_1",
      avatarName: "Creator",
      avatarDescription: "Warm approachable creator",
      avatarPhotoId: "photo_1",
      avatarPhotoObject: {
        contentType: "image/jpeg",
        key: "users/owner_123/photos/photo_1.jpg",
        size: 100,
      },
      voiceId: "voice_1",
      targetDurationSeconds: 30,
    }),
    ownerId: "owner_123",
    runId: "automation:clipr:owner_123:2026-05-31",
    taskType: "clipr-video",
    ...overrides,
  };
}

const scenePlan = [
  {
    id: "scene_1",
    index: 0,
    sceneType: "avatar" as const,
    scriptText: "This serum keeps my skin camera ready.",
    visualPrompt: "creator holding skincare bottle",
    estimatedDurationSeconds: 30,
  },
];

describe("POST /api/automation/clipr/execute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTOMATION_WORKER_SECRET = "automation_secret";
    mocks.convex.mutation.mockImplementation(async (fn) => {
      if (fn === api.automationTasks.claimNext) {
        return createTask();
      }

      if (fn === api.cliprJobs.recordAvatarVideoOutputFromAutomation) {
        return {
          id: "automation:clipr:owner_123:2026-05-31:1",
          status: "ready-to-save",
          stage: "browser-save",
        };
      }

      if (fn === api.mediaJobs.createCliprFinalizationFromAutomation) {
        return {
          id: "media:clipr-finalization:automation:clipr:owner_123:2026-05-31:1",
        };
      }

      return null;
    });
    mocks.createCliprTextGeneration.mockResolvedValue({
      filledHook: "Camera-ready skin in one step",
      hookStyleKey: "direct",
      hookTemplateId: "template_1",
      providerModel: "openai/gpt-4.1",
      scenePlan,
      script: "This serum keeps my skin camera ready.",
      variablesUsed: { product: "serum" },
    });
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      url: "https://r2.example/photo.jpg",
    });
    mocks.createCliprSceneAvatarImage.mockResolvedValue({
      body: new ArrayBuffer(8),
      contentType: "image/jpeg",
      modelId: "openai/gpt-image-2",
      outputUrl: "https://replicate.example/avatar-source.jpg",
      predictionId: "image_prediction_1",
    });
    mocks.saveCliprSceneImageObject.mockResolvedValue({
      contentType: "image/jpeg",
      key: "users/owner_123/clipr-scenes/job/image.jpg",
      size: 8,
    });
    mocks.createCliprSyncedAvatarVideoOutput.mockResolvedValue({
      avatarVideoObject: {
        contentType: "video/mp4",
        key: "users/owner_123/clipr-scenes/job/avatar.mp4",
        size: 16,
      },
      avatarVideoProviderPredictionId: "video_prediction_1",
      providerModels: ["elevenlabs/v3", "prunaai/p-video-avatar"],
    });
  });

  it("rejects unauthorized automation requests", async () => {
    const response = await POST(createRequest("wrong"));

    expect(response.status).toBe(401);
    expect(mocks.createConvexHttpClient).not.toHaveBeenCalled();
  });

  it("returns an empty task response when no Clipr task is queued", async () => {
    mocks.convex.mutation.mockReset();
    mocks.convex.mutation.mockResolvedValueOnce(null);

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ task: null });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.automationTasks.claimNext,
      expect.objectContaining({
        secret: "automation_secret",
        tool: "clipr",
      }),
    );
    expect(mocks.createCliprTextGeneration).not.toHaveBeenCalled();
  });

  it("runs the Clipr provider steps and leaves the task ready for media finalization", async () => {
    const response = await POST(
      createRequest("automation_secret", {
        now: "2026-05-31T10:00:00.000Z",
        workerId: "worker_1",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.task).toEqual(
      expect.objectContaining({
        id: "automation:clipr:owner_123:2026-05-31:1",
        stage: "awaiting-media-finalization",
        status: "running",
      }),
    );
    expect(body.job).toEqual(
      expect.objectContaining({
        id: "automation:clipr:owner_123:2026-05-31:1",
        stage: "browser-save",
        status: "ready-to-save",
      }),
    );
    expect(body.mediaJob).toEqual(
      expect.objectContaining({
        id: "media:clipr-finalization:automation:clipr:owner_123:2026-05-31:1",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.automationTasks.claimNext,
      expect.objectContaining({
        lockedUntil: "2026-05-31T10:45:00.000Z",
        secret: "automation_secret",
        tool: "clipr",
        updatedAt: "2026-05-31T10:00:00.000Z",
        workerId: "worker_1",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.cliprJobs.createQueuedFromAutomation,
      expect.objectContaining({
        ownerId: "owner_123",
        productId: "product_1",
        targetDurationSeconds: 60,
        voiceId: "voice_1",
      }),
    );
    expect(mocks.createCliprTextGeneration).toHaveBeenCalledWith(
      expect.objectContaining({
        durationSeconds: 60,
        purpose: "clipr",
        slideCount: 4,
      }),
    );
    expect(mocks.createCliprSceneAvatarImage).toHaveBeenCalledWith(
      expect.objectContaining({
        avatarDescription: "Warm approachable creator",
        referenceImageUrl: "https://r2.example/photo.jpg",
      }),
    );
    expect(mocks.createCliprSyncedAvatarVideoOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: "https://replicate.example/avatar-source.jpg",
        jobId: "automation:clipr:owner_123:2026-05-31:1",
        lipSyncModelId: "pixverse/lipsync",
        script: "This serum keeps my skin camera ready.",
        targetDurationSeconds: 60,
        ttsModelId: "elevenlabs/v3",
        userId: "owner_123",
        voiceId: "voice_1",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.mediaJobs.createCliprFinalizationFromAutomation,
      expect.objectContaining({
        id: "media:clipr-finalization:automation:clipr:owner_123:2026-05-31:1",
        idempotencyKey:
          "automation:clipr:owner_123:2026-05-31:1:clipr-finalization",
        ownerId: "owner_123",
        secret: "automation_secret",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.automationTasks.markStatus,
      expect.objectContaining({
        id: "automation:clipr:owner_123:2026-05-31:1",
        mediaJobId:
          "media:clipr-finalization:automation:clipr:owner_123:2026-05-31:1",
        ownerId: "owner_123",
        providerJobId: "video_prediction_1",
        stage: "awaiting-media-finalization",
        status: "running",
      }),
    );
  });

  it("marks the task and Clipr job failed when provider generation fails", async () => {
    mocks.createCliprTextGeneration.mockRejectedValueOnce(
      new Error("provider unavailable"),
    );

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ message: "provider unavailable" });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.automationTasks.markStatus,
      expect.objectContaining({
        error: "provider unavailable",
        id: "automation:clipr:owner_123:2026-05-31:1",
        ownerId: "owner_123",
        stage: "provider-failed",
        status: "failed",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.cliprJobs.failFromAutomation,
      expect.objectContaining({
        error: "provider unavailable",
        id: "automation:clipr:owner_123:2026-05-31:1",
        ownerId: "owner_123",
      }),
    );
  });
});
