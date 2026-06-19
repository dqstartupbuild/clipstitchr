import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUploadProcessor } from "@/lib/clipstitchr/hooks/useUploadProcessor";

const mocks = vi.hoisted(() => ({
  createId: vi.fn(),
  createUploadVideoJob: vi.fn(),
  uploadBlobsToR2: vi.fn(),
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

vi.mock("@/lib/clipstitchr/client/createUploadVideoJob", () => ({
  createUploadVideoJob: mocks.createUploadVideoJob,
}));

vi.mock("@/lib/clipstitchr/client/r2/uploadBlobsToR2", () => ({
  uploadBlobsToR2: mocks.uploadBlobsToR2,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: mocks.createId,
}));

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
    mocks.uploadBlobsToR2.mockResolvedValue([
      {
        contentType: "video/quicktime",
        key: "users/user_123/upload-sources/clip_1/source.mov",
        size: 100,
      },
    ]);
    mocks.createUploadVideoJob.mockResolvedValue({
      id: "media:upload-normalization:clip_1",
      status: "queued",
    });
  });

  it("ignores empty or non-video selections", async () => {
    const state = useUploadProcessor({});

    await state.processFiles([]);
    await state.processFiles([
      new File(["notes"], "notes.txt", { type: "text/plain" }),
    ]);

    expect(mocks.uploadBlobsToR2).not.toHaveBeenCalled();
    expect(mocks.createUploadVideoJob).not.toHaveBeenCalled();
  });

  it("requires a product before processing demo uploads", async () => {
    const state = useUploadProcessor({ initialClipType: "demo" });

    await state.processFiles([createVideoFile()]);

    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Choose a product before uploading demo videos.",
    );
    expect(mocks.uploadBlobsToR2).not.toHaveBeenCalled();
  });

  it("links demo uploads to the selected product", async () => {
    const state = useUploadProcessor({
      demoProductId: " product_1 ",
      initialClipType: "demo",
    });
    const file = createVideoFile("demo.mov");

    await state.processFiles([file]);

    expect(mocks.createUploadVideoJob).toHaveBeenCalledWith(
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
    expect(mocks.uploadBlobsToR2).not.toHaveBeenCalled();
  });

  it("uploads the source video and queues worker normalization", async () => {
    const onClipSaved = vi.fn();
    const state = useUploadProcessor({ onClipSaved });
    const file = createVideoFile();

    await state.processFiles([file]);

    expect(mocks.uploadBlobsToR2).toHaveBeenCalledWith([
      {
        blob: file,
        kind: "upload-source-video",
        recordId: "clip_1",
      },
    ]);
    expect(mocks.createUploadVideoJob).toHaveBeenCalledWith({
      clipId: "clip_1",
      clipType: "ugc",
      originalName: "upload clip.mov",
      productId: undefined,
      sourceVideoObject: expect.objectContaining({
        key: "users/user_123/upload-sources/clip_1/source.mov",
      }),
    });
    expect(onClipSaved).toHaveBeenCalledTimes(1);
    expect(mocks.useStateSetter).toHaveBeenCalledWith(expect.any(Function));
  });

  it("marks an individual queue item failed when enqueueing fails", async () => {
    mocks.createUploadVideoJob.mockRejectedValueOnce(new Error("queue down"));
    const state = useUploadProcessor({});

    await state.processFiles([createVideoFile()]);

    expect(mocks.useStateSetter).toHaveBeenCalledWith(expect.any(Function));
  });

  it("clears the queue through the exposed command", () => {
    const state = useUploadProcessor({});

    state.clearQueue();

    expect(mocks.useStateSetter).toHaveBeenCalledWith([]);
  });
});
