import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUploadProcessor } from "@/lib/clipstitchr/hooks/useUploadProcessor";

const mocks = vi.hoisted(() => ({
  analyzeNormalizedVideoUpload: vi.fn(),
  createBrowserUploadVideoClipSaveArgs: vi.fn(),
  createId: vi.fn(),
  createVideoPosterBlob: vi.fn(),
  deleteObjectsFromR2: vi.fn(),
  normalizeUploadedVideo: vi.fn(),
  queueUploadVideoWorkerFallback: vi.fn(),
  saveClip: vi.fn(),
  uploadNormalizedVideoClipObjects: vi.fn(),
  useStateSetter: vi.fn(),
}));

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
  useMutation: () => mocks.saveClip,
}));

vi.mock("@/lib/clipstitchr/client/analyzeNormalizedVideoUpload", () => ({
  analyzeNormalizedVideoUpload: mocks.analyzeNormalizedVideoUpload,
}));

vi.mock("@/lib/clipstitchr/client/createBrowserUploadVideoClipSaveArgs", () => ({
  createBrowserUploadVideoClipSaveArgs:
    mocks.createBrowserUploadVideoClipSaveArgs,
}));

vi.mock("@/lib/clipstitchr/client/r2/deleteObjectsFromR2", () => ({
  deleteObjectsFromR2: mocks.deleteObjectsFromR2,
}));

vi.mock("@/lib/clipstitchr/client/r2/uploadNormalizedVideoClipObjects", () => ({
  uploadNormalizedVideoClipObjects: mocks.uploadNormalizedVideoClipObjects,
}));

vi.mock("@/lib/clipstitchr/client/queueUploadVideoWorkerFallback", () => ({
  queueUploadVideoWorkerFallback: mocks.queueUploadVideoWorkerFallback,
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

const videoObject = {
  contentType: "video/mp4",
  key: "users/user_123/video-clips/clip_1/video.mp4",
  size: 100,
};
const posterObject = {
  contentType: "image/jpeg",
  key: "users/user_123/video-clips/clip_1/poster.jpg",
  size: 10,
};

function createVideoFile(name = "upload clip.mov") {
  return new File(["video"], name, { type: "video/quicktime" });
}

describe("useUploadProcessor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createId
      .mockReturnValueOnce("queue_1")
      .mockReturnValueOnce("clip_1")
      .mockReturnValue("next_id");
    mocks.normalizeUploadedVideo.mockImplementation(async (_file, onProgress) => {
      onProgress?.(0.5);

      return {
        blob: new Blob(["normalized"], { type: "video/mp4" }),
        metadata: {
          aspectRatio: 1080 / 1920,
          audioCanDecode: true,
          duration: 12,
          hasAudio: true,
          height: 1920,
          mimeType: "video/mp4",
          rotation: 0,
          videoCanDecode: true,
          width: 1080,
        },
        mimeType: "video/mp4",
      };
    });
    mocks.createVideoPosterBlob.mockResolvedValue(
      new Blob(["poster"], { type: "image/jpeg" }),
    );
    mocks.uploadNormalizedVideoClipObjects.mockResolvedValue({
      posterObject,
      videoObject,
    });
    mocks.analyzeNormalizedVideoUpload.mockResolvedValue({
      name: "Analyzed clip",
      tags: ["ugc"],
    });
    mocks.createBrowserUploadVideoClipSaveArgs.mockReturnValue({
      id: "clip_1",
      name: "Analyzed clip",
    });
    mocks.saveClip.mockResolvedValue("doc_1");
    mocks.queueUploadVideoWorkerFallback.mockResolvedValue({
      id: "media:upload-normalization:clip_1",
      status: "queued",
    });
    mocks.deleteObjectsFromR2.mockResolvedValue(undefined);
  });

  it("ignores empty or non-video selections", async () => {
    const state = useUploadProcessor({});

    await state.processFiles([]);
    await state.processFiles([
      new File(["notes"], "notes.txt", { type: "text/plain" }),
    ]);

    expect(mocks.normalizeUploadedVideo).not.toHaveBeenCalled();
    expect(mocks.queueUploadVideoWorkerFallback).not.toHaveBeenCalled();
  });

  it("requires a product before processing demo uploads", async () => {
    const state = useUploadProcessor({ initialClipType: "demo" });

    await state.processFiles([createVideoFile()]);

    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Choose a product before uploading demo videos.",
    );
    expect(mocks.normalizeUploadedVideo).not.toHaveBeenCalled();
  });

  it("links demo uploads to the selected product", async () => {
    const state = useUploadProcessor({
      demoProductId: " product_1 ",
      initialClipType: "demo",
    });
    const file = createVideoFile("demo.mov");

    await state.processFiles([file]);

    expect(mocks.analyzeNormalizedVideoUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        clipType: "demo",
        originalName: "demo.mov",
      }),
    );
    expect(mocks.createBrowserUploadVideoClipSaveArgs).toHaveBeenCalledWith(
      expect.objectContaining({
        clipId: "clip_1",
        clipType: "demo",
        originalName: "demo.mov",
        productId: "product_1",
      }),
    );
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

  it("normalizes, uploads, analyzes, and saves video uploads in the browser path", async () => {
    const onClipSaved = vi.fn();
    const state = useUploadProcessor({ onClipSaved });
    const file = createVideoFile();

    await state.processFiles([file]);

    expect(mocks.normalizeUploadedVideo).toHaveBeenCalledWith(
      file,
      expect.any(Function),
      { fit: "cover" },
    );
    expect(mocks.createVideoPosterBlob).toHaveBeenCalledWith(expect.any(Blob));
    expect(mocks.uploadNormalizedVideoClipObjects).toHaveBeenCalledWith({
      clipId: "clip_1",
      posterBlob: expect.any(Blob),
      videoBlob: expect.any(Blob),
    });
    expect(mocks.analyzeNormalizedVideoUpload).toHaveBeenCalledWith({
      clipType: "ugc",
      originalName: "upload clip.mov",
      posterBlob: expect.any(Blob),
      videoObject,
    });
    expect(mocks.saveClip).toHaveBeenCalledWith({
      id: "clip_1",
      name: "Analyzed clip",
    });
    expect(mocks.queueUploadVideoWorkerFallback).not.toHaveBeenCalled();
    expect(onClipSaved).toHaveBeenCalledTimes(1);
    expect(mocks.useStateSetter).toHaveBeenCalledWith(expect.any(Function));
  });

  it("queues worker normalization when browser normalization fails", async () => {
    const onClipSaved = vi.fn();
    mocks.normalizeUploadedVideo.mockRejectedValueOnce(
      new Error("unsupported browser codec"),
    );
    const state = useUploadProcessor({ onClipSaved });
    const file = createVideoFile();

    await state.processFiles([file]);

    expect(mocks.queueUploadVideoWorkerFallback).toHaveBeenCalledWith({
      clipId: "clip_1",
      clipType: "ugc",
      file,
      productId: undefined,
    });
    expect(mocks.saveClip).not.toHaveBeenCalled();
    expect(onClipSaved).toHaveBeenCalledTimes(1);
  });

  it("cleans up uploaded objects when browser save work fails", async () => {
    mocks.analyzeNormalizedVideoUpload.mockRejectedValueOnce(
      new Error("analysis down"),
    );
    const state = useUploadProcessor({});

    await state.processFiles([createVideoFile()]);

    expect(mocks.deleteObjectsFromR2).toHaveBeenCalledWith([
      videoObject,
      posterObject,
    ]);
    expect(mocks.queueUploadVideoWorkerFallback).not.toHaveBeenCalled();
  });

  it("clears the queue through the exposed command", () => {
    const state = useUploadProcessor({});

    state.clearQueue();

    expect(mocks.useStateSetter).toHaveBeenCalledWith([]);
  });
});
