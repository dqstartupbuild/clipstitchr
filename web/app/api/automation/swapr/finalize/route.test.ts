import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { POST } from "./route";

const mocks = vi.hoisted(() => {
  const convex = {
    mutation: vi.fn(),
  };
  const replicate = {
    predictions: {
      get: vi.fn(),
    },
  };

  return {
    convex,
    createConvexHttpClient: vi.fn(() => convex),
    createId: vi.fn(() => "clip_automation_1"),
    createReplicateClient: vi.fn(() => replicate),
    replicate,
  };
});

vi.mock("@/convex/_generated/api", () => ({
  api: {
    automationRuns: {
      markStatus: "automationRuns.markStatus",
    },
    automationTasks: {
      claimNextByStage: "automationTasks.claimNextByStage",
      markStatus: "automationTasks.markStatus",
    },
    mediaJobs: {
      createSwaprFinalizationFromAutomation:
        "mediaJobs.createSwaprFinalizationFromAutomation",
    },
    replicateJobs: {
      updateSwaprAutomationJobStatus:
        "replicateJobs.updateSwaprAutomationJobStatus",
    },
  },
}));

vi.mock("@/lib/clipstitchr/server/convex/createConvexHttpClient", () => ({
  createConvexHttpClient: mocks.createConvexHttpClient,
}));

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

function createRequest(secret = "automation_secret", body: unknown = {}) {
  return new Request("http://localhost/api/automation/swapr/finalize", {
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
      automationDate: "2026-05-31",
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
    providerJobIds: ["prediction_1"],
    runId: "automation:swapr:owner_123:2026-05-31",
    taskType: "swapr-video",
    ...overrides,
  };
}

describe("POST /api/automation/swapr/finalize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTOMATION_WORKER_SECRET = "automation_secret";
    mocks.createId.mockReturnValue("clip_automation_1");
    mocks.convex.mutation.mockImplementation(async (fn) => {
      if (fn === api.automationTasks.claimNextByStage) {
        return createTask();
      }

      if (fn === api.mediaJobs.createSwaprFinalizationFromAutomation) {
        return {
          id: "media:swapr-finalization:automation:swapr:owner_123:2026-05-31:1",
        };
      }

      return null;
    });
    mocks.replicate.predictions.get.mockResolvedValue({
      error: null,
      id: "prediction_1",
      output: null,
      status: "processing",
    });
  });

  it("rejects unauthorized automation requests", async () => {
    const response = await POST(createRequest("wrong"));

    expect(response.status).toBe(401);
    expect(mocks.createConvexHttpClient).not.toHaveBeenCalled();
  });

  it("returns an empty task response when no provider-created task is ready", async () => {
    mocks.convex.mutation.mockReset();
    mocks.convex.mutation.mockResolvedValueOnce(null);

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ task: null });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.automationTasks.claimNextByStage,
      expect.objectContaining({
        secret: "automation_secret",
        stage: "provider-created",
        tool: "swapr",
      }),
    );
    expect(mocks.replicate.predictions.get).not.toHaveBeenCalled();
  });

  it("polls an in-flight Replicate prediction and releases the task lock", async () => {
    const response = await POST(
      createRequest("automation_secret", {
        now: "2026-05-31T10:00:00.000Z",
        workerId: "worker_1",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      mediaJob: null,
      prediction: {
        id: "prediction_1",
        status: "processing",
      },
      task: {
        id: "automation:swapr:owner_123:2026-05-31:1",
        ownerId: "owner_123",
        runId: "automation:swapr:owner_123:2026-05-31",
        stage: "provider-created",
        status: "running",
      },
    });
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.automationTasks.claimNextByStage,
      expect.objectContaining({
        lockedUntil: "2026-05-31T10:15:00.000Z",
        secret: "automation_secret",
        stage: "provider-created",
        tool: "swapr",
        updatedAt: "2026-05-31T10:00:00.000Z",
        workerId: "worker_1",
      }),
    );
    expect(mocks.replicate.predictions.get).toHaveBeenCalledWith(
      "prediction_1",
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.replicateJobs.updateSwaprAutomationJobStatus,
      expect.objectContaining({
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

  it("creates a Swapr media finalization job after provider success", async () => {
    mocks.replicate.predictions.get.mockResolvedValueOnce({
      error: null,
      id: "prediction_1",
      output: "https://replicate.delivery/output.mp4",
      status: "succeeded",
    });

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.task).toEqual(
      expect.objectContaining({
        stage: "awaiting-media-finalization",
        status: "running",
      }),
    );
    expect(body.mediaJob).toEqual({
      id: "media:swapr-finalization:automation:swapr:owner_123:2026-05-31:1",
    });
    const mediaJobCall = mocks.convex.mutation.mock.calls.find(
      ([fn]) => fn === api.mediaJobs.createSwaprFinalizationFromAutomation,
    );
    expect(mediaJobCall).toBeTruthy();
    const mediaJobArgs = mediaJobCall?.[1] as {
      inputSnapshotJson: string;
    };
    expect(JSON.parse(mediaJobArgs.inputSnapshotJson)).toEqual(
      expect.objectContaining({
        automationDate: "2026-05-31",
        automationRunId: "automation:swapr:owner_123:2026-05-31",
        automationTaskId: "automation:swapr:owner_123:2026-05-31:1",
        characterOrientation: "image",
        clipId: "clip_automation_1",
        keepOriginalSound: false,
        mode: "std",
        outputUrl: "https://replicate.delivery/output.mp4",
        predictionId: "prediction_1",
        referenceClipId: "clip_1",
        sourcePhotoId: "photo_1",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.automationTasks.markStatus,
      expect.objectContaining({
        id: "automation:swapr:owner_123:2026-05-31:1",
        mediaJobId:
          "media:swapr-finalization:automation:swapr:owner_123:2026-05-31:1",
        ownerId: "owner_123",
        providerJobId: "prediction_1",
        releaseLock: true,
        stage: "awaiting-media-finalization",
        status: "running",
      }),
    );
  });

  it("marks the task and run failed when the provider fails", async () => {
    mocks.replicate.predictions.get.mockResolvedValueOnce({
      error: "provider failed",
      id: "prediction_1",
      output: null,
      status: "failed",
    });

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.task).toEqual(
      expect.objectContaining({
        stage: "provider-failed",
        status: "failed",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.automationTasks.markStatus,
      expect.objectContaining({
        error: "provider failed",
        id: "automation:swapr:owner_123:2026-05-31:1",
        ownerId: "owner_123",
        stage: "provider-failed",
        status: "failed",
      }),
    );
    expect(mocks.convex.mutation).toHaveBeenCalledWith(
      api.automationRuns.markStatus,
      expect.objectContaining({
        error: "provider failed",
        id: "automation:swapr:owner_123:2026-05-31",
        ownerId: "owner_123",
        status: "failed",
      }),
    );
  });
});
