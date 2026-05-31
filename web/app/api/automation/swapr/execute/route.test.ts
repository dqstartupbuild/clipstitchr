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
    createConvexHttpClient: vi.fn(() => convex),
    createReplicateClient: vi.fn(() => replicate),
    getR2DownloadSignedUrl: vi.fn(),
    replicate,
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    automationTasks: {
      claimNext: "automationTasks.claimNext",
      markStatus: "automationTasks.markStatus",
    },
    replicateJobs: {
      recordSwaprAutomationJob: "replicateJobs.recordSwaprAutomationJob",
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: mocks.createConvexHttpClient,
}));

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));

vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getR2DownloadSignedUrl,
}));

function createRequest(secret = "automation_secret", body: unknown = {}) {
  return new Request("http://localhost/api/automation/swapr/execute", {
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
    id: "automation:swapr:owner_123:2026-05-31:1",
    inputSnapshotJson: JSON.stringify({
      characterOrientation: "image",
      keepOriginalSound: false,
      mode: "std",
      photoId: "photo_1",
      photoObject: {
        contentType: "image/jpeg",
        key: "users/owner_123/photos/photo_1.jpg",
        size: 50,
      },
      prompt: "natural UGC motion",
      referenceClipId: "clip_1",
      referenceClipName: "Reference UGC",
      referenceDurationSeconds: 8,
      referenceVideoObject: {
        contentType: "video/mp4",
        key: "users/owner_123/videos/clip_1.mp4",
        size: 100,
      },
      sourcePhotoName: "Avatar Photo",
    }),
    ownerId: "owner_123",
    runId: "automation:swapr:owner_123:2026-05-31",
    taskType: "swapr-video",
    ...overrides,
  };
}

describe("POST /api/automation/swapr/execute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTOMATION_WORKER_SECRET = "automation_secret";
    mocks.convex.mutation.mockResolvedValue(null);
    mocks.convex.mutation.mockResolvedValueOnce(createTask());
    mocks.getR2DownloadSignedUrl
      .mockResolvedValueOnce({ url: "https://r2.example/photo.jpg" })
      .mockResolvedValueOnce({ url: "https://r2.example/video.mp4" });
    mocks.replicate.predictions.create.mockResolvedValue({
      error: null,
      id: "prediction_1",
      logs: "",
      output: null,
      status: "processing",
      urls: {
        cancel: "https://replicate.example/cancel",
        get: "https://replicate.example/get",
        web: "https://replicate.example/web",
      },
    });
  });

  it("rejects unauthorized automation requests", async () => {
    const response = await POST(createRequest("wrong"));

    expect(response.status).toBe(401);
    expect(mocks.createConvexHttpClient).not.toHaveBeenCalled();
  });

  it("returns an empty task response when no Swapr task is queued", async () => {
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
        tool: "swapr",
      }),
    );
    expect(mocks.replicate.predictions.create).not.toHaveBeenCalled();
  });

  it("claims a Swapr automation task and creates a Replicate prediction", async () => {
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
        id: "automation:swapr:owner_123:2026-05-31:1",
        stage: "provider-created",
        status: "running",
      }),
    );
    expect(body.prediction).toEqual(
      expect.objectContaining({
        characterOrientation: "image",
        id: "prediction_1",
        mode: "std",
        status: "processing",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.automationTasks.claimNext,
      expect.objectContaining({
        lockedUntil: "2026-05-31T10:15:00.000Z",
        secret: "automation_secret",
        tool: "swapr",
        updatedAt: "2026-05-31T10:00:00.000Z",
        workerId: "worker_1",
      }),
    );
    expect(mocks.replicate.predictions.create).toHaveBeenCalledWith({
      model: "kwaivgi/kling-v3-motion-control",
      input: {
        character_orientation: "image",
        image: "https://r2.example/photo.jpg",
        keep_original_sound: false,
        mode: "std",
        prompt: "natural UGC motion",
        video: "https://r2.example/video.mp4",
      },
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.replicateJobs.recordSwaprAutomationJob,
      expect.objectContaining({
        modelId: "kwaivgi/kling-v3-motion-control",
        ownerId: "owner_123",
        predictionId: "prediction_1",
        secret: "automation_secret",
        status: "processing",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.automationTasks.markStatus,
      expect.objectContaining({
        id: "automation:swapr:owner_123:2026-05-31:1",
        ownerId: "owner_123",
        providerJobId: "prediction_1",
        stage: "provider-created",
        status: "running",
      }),
    );
  });

  it("marks the task failed when provider setup fails", async () => {
    mocks.replicate.predictions.create.mockRejectedValueOnce(
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
        id: "automation:swapr:owner_123:2026-05-31:1",
        ownerId: "owner_123",
        stage: "provider-failed",
        status: "failed",
      }),
    );
  });
});
