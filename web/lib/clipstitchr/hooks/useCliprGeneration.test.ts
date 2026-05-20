import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCliprGeneration } from "@/lib/clipstitchr/hooks/useCliprGeneration";

const mocks = vi.hoisted(() => {
  const mutationFns = new Map<string, ReturnType<typeof vi.fn>>();

  return {
    createCliprJob: vi.fn(),
    createId: vi.fn(),
    createVideoPosterBlob: vi.fn(),
    downloadBlobFromR2: vi.fn(),
    getCliprFinalClipName: vi.fn(),
    mutationFns,
    normalizeUploadedVideo: vi.fn(),
    stateValues: [] as unknown[],
    uploadBlobsToR2: vi.fn(),
    useMutation: vi.fn((mutationId: string) => {
      const mutation = mutationFns.get(mutationId) ?? vi.fn();

      mutationFns.set(mutationId, mutation);
      return mutation;
    }),
    useQuery: vi.fn(),
    useStateSetter: vi.fn(),
  };
});

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useState: (initialValue: unknown) => {
    const value = mocks.stateValues.length
      ? mocks.stateValues.shift()
      : typeof initialValue === "function"
        ? (initialValue as () => unknown)()
        : initialValue;

    return [value, mocks.useStateSetter];
  },
}));

vi.mock("convex/react", () => ({
  useMutation: mocks.useMutation,
  useQuery: mocks.useQuery,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    cliprJobs: {
      finalizeWithClip: "cliprJobs.finalizeWithClip",
      get: "cliprJobs.get",
      markBrowserSaving: "cliprJobs.markBrowserSaving",
    },
  },
}));

vi.mock("@/lib/clipstitchr/client/createCliprJob", () => ({
  createCliprJob: mocks.createCliprJob,
}));

vi.mock("@/lib/clipstitchr/client/r2/downloadBlobFromR2", () => ({
  downloadBlobFromR2: mocks.downloadBlobFromR2,
}));

vi.mock("@/lib/clipstitchr/client/r2/uploadBlobsToR2", () => ({
  uploadBlobsToR2: mocks.uploadBlobsToR2,
}));

vi.mock("@/lib/clipstitchr/media/createVideoPosterBlob", () => ({
  createVideoPosterBlob: mocks.createVideoPosterBlob,
}));

vi.mock("@/lib/clipstitchr/media/normalizeUploadedVideo", () => ({
  normalizeUploadedVideo: mocks.normalizeUploadedVideo,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

vi.mock("@/lib/clipstitchr/utils/getCliprFinalClipName", () => ({
  getCliprFinalClipName: mocks.getCliprFinalClipName,
}));

function getMutation(id: string) {
  const mutation = mocks.mutationFns.get(id);

  if (!mutation) {
    throw new Error(`Missing mocked mutation ${id}.`);
  }

  return mutation;
}

function createCliprJob(overrides: Record<string, unknown> = {}) {
  return {
    avatarId: "avatar_1",
    avatarPhotoId: "photo_1",
    avatarVideoObject: {
      contentType: "video/mp4",
      key: "users/user_123/clipr/job_1/video.mp4",
      size: 100,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "job_1",
    productId: "product_1",
    productName: "Product",
    progress: 0.68,
    scenePlan: [
      {
        estimatedDurationSeconds: 30,
        id: "scene_1",
        index: 0,
        sceneType: "avatar",
        scriptText: "Try this",
        visualPrompt: "Creator in studio",
      },
    ],
    stage: "browser-save",
    status: "ready-to-save",
    targetDurationSeconds: 30,
    updatedAt: "2026-05-20T00:00:00.000Z",
    voiceId: "Zephyr (Female)",
    ...overrides,
  };
}

function createGenerateOptions() {
  return {
    addMusic: true,
    avatarId: "avatar_1",
    durationSeconds: 30,
    musicTrackId: "track_1",
    productId: "product_1",
    voiceId: "Zephyr (Female)",
  } as unknown as Parameters<
    ReturnType<typeof useCliprGeneration>["generate"]
  >[0];
}

describe("useCliprGeneration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutationFns.clear();
    mocks.mutationFns.set(
      "cliprJobs.finalizeWithClip",
      vi.fn(async () => "clip_1"),
    );
    mocks.stateValues = [];
    mocks.createId
      .mockReturnValueOnce("job_1")
      .mockReturnValueOnce("clip_1")
      .mockReturnValue("next_id");
    mocks.useQuery.mockReturnValue(null);
    mocks.createCliprJob.mockResolvedValue(createCliprJob());
    mocks.downloadBlobFromR2.mockResolvedValue(
      new Blob(["avatar-video"], { type: "video/mp4" }),
    );
    mocks.normalizeUploadedVideo.mockResolvedValue({
      blob: new Blob(["normalized"], { type: "video/mp4" }),
      metadata: {
        aspectRatio: 9 / 16,
        duration: 30,
        hasAudio: true,
        height: 1920,
        mimeType: "video/mp4",
        width: 1080,
      },
      mimeType: "video/mp4",
    });
    mocks.createVideoPosterBlob.mockResolvedValue(
      new Blob(["poster"], { type: "image/jpeg" }),
    );
    mocks.getCliprFinalClipName.mockReturnValue("Product Clipr");
    mocks.uploadBlobsToR2.mockResolvedValue([
      {
        contentType: "video/mp4",
        key: "users/user_123/clips/clip_1.mp4",
        size: 100,
      },
      {
        contentType: "image/jpeg",
        key: "users/user_123/clips/clip_1.jpg",
        size: 10,
      },
    ]);
  });

  it.each([
    ["hook-script", 0.08, "Writing the full avatar script"],
    ["avatar-image", 0.25, "Generating avatar source image"],
    ["avatar-video", 0.45, "Generating full avatar video"],
    ["browser-save", 0.68, "Avatar video generated"],
    ["unknown", 0.05, "Starting Clipr generation"],
  ])("maps active %s jobs into progress copy", (stage, progress, message) => {
    mocks.stateValues = [
      "job_1",
      "reading",
      0,
      "Ready",
      null,
      null,
      null,
    ];
    mocks.useQuery.mockReturnValue(
      createCliprJob({
        music: stage === "avatar-video" ? undefined : undefined,
        progress,
        stage,
      }),
    );

    const state = useCliprGeneration({});

    expect(mocks.useQuery).toHaveBeenCalledWith("cliprJobs.get", {
      id: "job_1",
    });
    expect(state.message).toBe(message);
    expect(state.progress).toBe(progress);
  });

  it("normalizes, uploads, and finalizes a generated Clipr video", async () => {
    const onCreated = vi.fn();
    const state = useCliprGeneration({ onCreated });

    await expect(state.generate(createGenerateOptions())).resolves.toBe("clip_1");

    expect(mocks.createCliprJob).toHaveBeenCalledWith({
      ...createGenerateOptions(),
      jobId: "job_1",
    });
    expect(getMutation("cliprJobs.markBrowserSaving")).toHaveBeenCalledWith({
      id: "job_1",
      updatedAt: expect.any(String),
    });
    expect(mocks.downloadBlobFromR2).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "users/user_123/clipr/job_1/video.mp4",
      }),
    );
    expect(mocks.normalizeUploadedVideo).toHaveBeenCalledWith(
      expect.any(File),
      expect.any(Function),
      { fit: "cover" },
    );
    expect(mocks.uploadBlobsToR2).toHaveBeenCalledWith([
      expect.objectContaining({
        kind: "video-clip-video",
        recordId: "clip_1",
      }),
      expect.objectContaining({
        kind: "video-clip-poster",
        recordId: "clip_1",
      }),
    ]);
    expect(getMutation("cliprJobs.finalizeWithClip")).toHaveBeenCalledWith(
      expect.objectContaining({
        clipId: "clip_1",
        duration: 30,
        hasAudio: true,
        height: 1920,
        id: "job_1",
        name: "Product Clipr",
        posterObject: expect.objectContaining({
          key: "users/user_123/clips/clip_1.jpg",
        }),
        width: 1080,
      }),
    );
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(mocks.useStateSetter).toHaveBeenCalledWith("complete");
  });

  it("saves without a poster when poster capture fails", async () => {
    mocks.createVideoPosterBlob.mockRejectedValueOnce(new Error("no frame"));
    mocks.uploadBlobsToR2.mockResolvedValueOnce([
      {
        contentType: "video/mp4",
        key: "users/user_123/clips/clip_1.mp4",
        size: 100,
      },
    ]);
    const state = useCliprGeneration({});

    await expect(state.generate(createGenerateOptions())).resolves.toBe("clip_1");

    expect(mocks.uploadBlobsToR2).toHaveBeenCalledWith([
      expect.objectContaining({
        kind: "video-clip-video",
        recordId: "clip_1",
      }),
    ]);
    expect(getMutation("cliprJobs.finalizeWithClip")).toHaveBeenCalledWith(
      expect.objectContaining({
        posterObject: undefined,
        posterVersion: undefined,
      }),
    );
  });

  it("returns null and reports an error when the provider response is incomplete", async () => {
    mocks.createCliprJob.mockResolvedValueOnce(
      createCliprJob({
        scenePlan: [],
      }),
    );
    const state = useCliprGeneration({});

    await expect(state.generate(createGenerateOptions())).resolves.toBeNull();

    expect(getMutation("cliprJobs.markBrowserSaving")).not.toHaveBeenCalled();
    expect(mocks.useStateSetter).toHaveBeenCalledWith("error");
    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Clipr did not return the avatar script plan.",
    );
  });

  it("returns null when the generated avatar video is missing", async () => {
    mocks.createCliprJob.mockResolvedValueOnce(
      createCliprJob({
        avatarVideoObject: undefined,
      }),
    );
    const state = useCliprGeneration({});

    await expect(state.generate(createGenerateOptions())).resolves.toBeNull();

    expect(getMutation("cliprJobs.markBrowserSaving")).not.toHaveBeenCalled();
    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Clipr did not return the generated avatar video.",
    );
  });
});
