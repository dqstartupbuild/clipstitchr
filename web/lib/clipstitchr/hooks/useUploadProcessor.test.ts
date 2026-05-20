import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUploadProcessor } from "@/lib/clipstitchr/hooks/useUploadProcessor";

const mocks = vi.hoisted(() => {
  const mutationFns = new Map<string, ReturnType<typeof vi.fn>>();

  return {
    analyzeUploadAsset: vi.fn(),
    createId: vi.fn(),
    createR2DownloadUrl: vi.fn(),
    createVideoPosterBlob: vi.fn(),
    mutationFns,
    normalizeUploadedVideo: vi.fn(),
    uploadBlobsToR2: vi.fn(),
    useMutation: vi.fn((mutationId: string) => {
      const mutation = mutationFns.get(mutationId) ?? vi.fn();

      mutationFns.set(mutationId, mutation);
      return mutation;
    }),
    useStateSetter: vi.fn(),
  };
});

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useState: (initialValue: unknown) => [
    typeof initialValue === "function"
      ? (initialValue as () => unknown)()
      : initialValue,
    mocks.useStateSetter,
  ],
}));

vi.mock("convex/react", () => ({
  useMutation: mocks.useMutation,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    videoClips: {
      save: "videoClips.save",
    },
  },
}));

vi.mock("@/lib/clipstitchr/client/analyzeUploadAsset", () => ({
  analyzeUploadAsset: mocks.analyzeUploadAsset,
}));

vi.mock("@/lib/clipstitchr/client/r2/createR2DownloadUrl", () => ({
  createR2DownloadUrl: mocks.createR2DownloadUrl,
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

function getMutation(id: string) {
  const mutation = mocks.mutationFns.get(id);

  if (!mutation) {
    throw new Error(`Missing mocked mutation ${id}.`);
  }

  return mutation;
}

function createVideoFile(name = "upload clip.mov") {
  return new File(["video"], name, { type: "video/quicktime" });
}

describe("useUploadProcessor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutationFns.clear();
    mocks.createId.mockReset();
    mocks.createId
      .mockReturnValueOnce("queue_1")
      .mockReturnValueOnce("clip_1")
      .mockReturnValue("next_id");
    mocks.normalizeUploadedVideo.mockResolvedValue({
      blob: new Blob(["normalized"], { type: "video/mp4" }),
      metadata: {
        aspectRatio: 9 / 16,
        duration: 8,
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
    mocks.createR2DownloadUrl.mockResolvedValue({
      url: "https://r2.example/clip_1.mp4",
    });
    mocks.analyzeUploadAsset.mockResolvedValue({
      locationDescription: "Studio",
      name: "Analyzed Clip",
      tags: ["talking-head"],
      videoDescription: "Creator explains the product",
    });
  });

  it("ignores empty or non-video selections", async () => {
    const state = useUploadProcessor({});

    await state.processFiles([]);
    await state.processFiles([
      new File(["notes"], "notes.txt", { type: "text/plain" }),
    ]);

    expect(mocks.normalizeUploadedVideo).not.toHaveBeenCalled();
    expect(getMutation("videoClips.save")).not.toHaveBeenCalled();
  });

  it("requires a product before processing demo uploads", async () => {
    const state = useUploadProcessor({ initialClipType: "demo" });

    await state.processFiles([createVideoFile()]);

    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Choose a product before uploading demo videos.",
    );
    expect(mocks.normalizeUploadedVideo).not.toHaveBeenCalled();
  });

  it("rejects upload batches over the clip limit", async () => {
    const state = useUploadProcessor({});
    const files = Array.from({ length: 21 }, (_, index) =>
      createVideoFile(`clip-${index}.mp4`),
    );

    await state.processFiles(files);

    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Choose up to 20 videos at once.",
    );
    expect(mocks.normalizeUploadedVideo).not.toHaveBeenCalled();
  });

  it("normalizes, analyzes, uploads, saves, and reports a completed clip", async () => {
    const onClipSaved = vi.fn();
    const state = useUploadProcessor({ onClipSaved });
    const file = createVideoFile();

    await state.processFiles([file]);

    expect(mocks.normalizeUploadedVideo).toHaveBeenCalledWith(
      file,
      expect.any(Function),
    );
    expect(mocks.createR2DownloadUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "users/user_123/clips/clip_1.mp4",
      }),
    );
    expect(mocks.analyzeUploadAsset).toHaveBeenCalledWith({
      fallbackBlob: expect.any(Blob),
      mediaKind: "ugc-video",
      originalName: "upload clip.mov",
      sourceSizeBytes: 10,
      sourceUrl: "https://r2.example/clip_1.mp4",
    });
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
    expect(getMutation("videoClips.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        clipType: "ugc",
        defaultTrimRange: { end: 8, start: 0 },
        id: "clip_1",
        locationDescription: "Studio",
        name: "Analyzed Clip",
        posterObject: expect.objectContaining({
          key: "users/user_123/clips/clip_1.jpg",
        }),
        sourceMimeType: "video/quicktime",
        tags: ["ugc", "talking-head"],
        videoDescription: "Creator explains the product",
      }),
    );
    expect(onClipSaved).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "clip_1",
        name: "Analyzed Clip",
      }),
    );
  });

  it("falls back when poster, signed download URL, and analysis fail", async () => {
    mocks.createVideoPosterBlob.mockRejectedValueOnce(new Error("no poster"));
    mocks.createR2DownloadUrl.mockRejectedValueOnce(new Error("no url"));
    mocks.analyzeUploadAsset.mockRejectedValueOnce(new Error("no analysis"));
    mocks.uploadBlobsToR2.mockResolvedValueOnce([
      {
        contentType: "video/mp4",
        key: "users/user_123/clips/clip_1.mp4",
        size: 100,
      },
    ]);
    const state = useUploadProcessor({
      demoProductId: " product_1 ",
      initialClipType: "demo",
    });

    await state.processFiles([createVideoFile("Product Demo.mp4")]);

    expect(mocks.uploadBlobsToR2).toHaveBeenCalledWith([
      expect.objectContaining({
        kind: "video-clip-video",
        recordId: "clip_1",
      }),
    ]);
    expect(getMutation("videoClips.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        clipType: "demo",
        name: "Product Demo",
        posterObject: undefined,
        posterVersion: undefined,
        productId: "product_1",
        tags: ["demo"],
      }),
    );
  });

  it("marks an individual queue item failed when normalization fails", async () => {
    mocks.normalizeUploadedVideo.mockRejectedValueOnce(new Error("bad codec"));
    const state = useUploadProcessor({});

    await state.processFiles([createVideoFile()]);

    expect(getMutation("videoClips.save")).not.toHaveBeenCalled();
    expect(mocks.useStateSetter).toHaveBeenCalledWith(expect.any(Function));
  });

  it("clears the queue through the exposed command", () => {
    const state = useUploadProcessor({});

    state.clearQueue();

    expect(mocks.useStateSetter).toHaveBeenCalledWith([]);
  });
});
