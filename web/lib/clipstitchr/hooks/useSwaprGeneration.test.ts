import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSwaprGeneration } from "@/lib/clipstitchr/hooks/useSwaprGeneration";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import type { SwaprReferenceVideoSegment } from "@/lib/clipstitchr/types/SwaprReferenceVideoSegment";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

const mocks = vi.hoisted(() => {
  const mutationFns = new Map<string, ReturnType<typeof vi.fn>>();

  return {
    createId: vi.fn(),
    createSwaprPrediction: vi.fn(),
    createVideoPosterBlob: vi.fn(),
    downloadSwaprPredictionOutputBlob: vi.fn(),
    mutationFns,
    normalizeUploadedVideo: vi.fn(),
    stitchLongrSequence: vi.fn(),
    uploadBlobsToR2: vi.fn(),
    useMutation: vi.fn((mutationId: string) => {
      const mutation = mutationFns.get(mutationId) ?? vi.fn();

      mutationFns.set(mutationId, mutation);
      return mutation;
    }),
    useStateSetter: vi.fn(),
    waitForSwaprPrediction: vi.fn(),
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

vi.mock("@/lib/clipstitchr/client/createSwaprPrediction", () => ({
  createSwaprPrediction: mocks.createSwaprPrediction,
}));

vi.mock(
  "@/lib/clipstitchr/client/downloadSwaprPredictionOutputBlob",
  () => ({
    downloadSwaprPredictionOutputBlob:
      mocks.downloadSwaprPredictionOutputBlob,
  }),
);

vi.mock("@/lib/clipstitchr/client/r2/uploadBlobsToR2", () => ({
  uploadBlobsToR2: mocks.uploadBlobsToR2,
}));

vi.mock("@/lib/clipstitchr/client/waitForSwaprPrediction", () => ({
  waitForSwaprPrediction: mocks.waitForSwaprPrediction,
}));

vi.mock("@/lib/clipstitchr/media/createVideoPosterBlob", () => ({
  createVideoPosterBlob: mocks.createVideoPosterBlob,
}));

vi.mock("@/lib/clipstitchr/media/normalizeUploadedVideo", () => ({
  normalizeUploadedVideo: mocks.normalizeUploadedVideo,
}));

vi.mock("@/lib/clipstitchr/media/stitchLongrSequence", () => ({
  stitchLongrSequence: mocks.stitchLongrSequence,
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

function createPhoto() {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    height: 1920,
    id: "photo_1",
    mimeType: "image/jpeg",
    name: "Avatar",
    originalName: "avatar.jpg",
    photoObject: {
      contentType: "image/jpeg",
      key: "users/user_123/photos/photo_1.jpg",
      size: 10,
    },
    size: 10,
    tags: ["photo"],
    updatedAt: "2026-05-20T00:00:00.000Z",
    width: 1080,
  } as unknown as PhotoAssetMetadata;
}

function createClip() {
  return {
    aspectRatio: 9 / 16,
    clipType: "ugc" as const,
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 12,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    mimeType: "video/mp4",
    name: "Source",
    originalName: "source.mp4",
    originalSize: 100,
    size: 100,
    sourceMimeType: "video/mp4",
    tags: ["ugc"],
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: "users/user_123/clips/clip_1.mp4",
      size: 100,
    },
    width: 1080,
  } as unknown as VideoClipMetadata;
}

function createSegment(index = 0) {
  return {
    duration: 6,
    endTime: 6,
    id: `segment_${index + 1}`,
    startTime: 0,
    url: `https://example.com/segment-${index + 1}.mp4`,
    videoObject: {
      contentType: "video/mp4",
      key: `users/user_123/swapr/segment-${index + 1}.mp4`,
      size: 50,
    },
  } as unknown as SwaprReferenceVideoSegment;
}

function createNormalizedBlob(label: string) {
  return new Blob([label], { type: "video/mp4" });
}

function createNormalizedResult(label: string, duration = 6) {
  return {
    blob: createNormalizedBlob(label),
    metadata: {
      aspectRatio: 9 / 16,
      duration,
      hasAudio: true,
      height: 1920,
      mimeType: "video/mp4",
      width: 1080,
    },
    mimeType: "video/mp4",
  };
}

describe("useSwaprGeneration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutationFns.clear();
    mocks.createId
      .mockReturnValueOnce("batch_1")
      .mockReturnValueOnce("segment_clip_1")
      .mockReturnValueOnce("generated_clip_1")
      .mockReturnValue("next_id");
    mocks.createSwaprPrediction.mockResolvedValue({
      characterOrientation: "portrait",
      id: "prediction_1",
      mode: "image-to-video",
      status: "processing",
    });
    mocks.waitForSwaprPrediction.mockImplementation(async ({ prediction }) => ({
      ...prediction,
      status: "succeeded",
    }));
    mocks.downloadSwaprPredictionOutputBlob.mockResolvedValue(
      new Blob(["raw"], { type: "video/mp4" }),
    );
    mocks.normalizeUploadedVideo.mockResolvedValue(
      createNormalizedResult("normalized"),
    );
    mocks.createVideoPosterBlob.mockResolvedValue(
      new Blob(["poster"], { type: "image/jpeg" }),
    );
    mocks.stitchLongrSequence.mockResolvedValue({
      blob: new Blob(["stitched"], { type: "video/mp4" }),
      duration: 12,
      mimeType: "video/mp4",
    });
    mocks.uploadBlobsToR2.mockResolvedValue([
      {
        contentType: "video/mp4",
        key: "users/user_123/clips/generated_clip_1.mp4",
        size: 100,
      },
      {
        contentType: "image/jpeg",
        key: "users/user_123/clips/generated_clip_1.jpg",
        size: 10,
      },
    ]);
  });

  it("generates and saves a single-segment Swapr clip", async () => {
    const onClipSaved = vi.fn();
    const state = useSwaprGeneration(onClipSaved);

    await state.generate({
      characterOrientation: "image",
      clip: createClip(),
      generationSpeedTier: "pro",
      keepOriginalSound: true,
      mode: "pro",
      photo: createPhoto(),
      prompt: "  walk toward camera  ",
      referenceVideoSegments: [createSegment()],
    });

    expect(mocks.createSwaprPrediction).toHaveBeenCalledWith(
      expect.objectContaining({
        batchId: "batch_1",
        characterOrientation: "image",
        generationSpeedTier: "pro",
        keepOriginalSound: true,
        mode: "pro",
        photoId: "photo_1",
        prompt: "  walk toward camera  ",
        segmentIndex: 0,
        totalSegmentCount: 1,
      }),
    );
    expect(mocks.normalizeUploadedVideo).toHaveBeenCalledWith(
      expect.any(File),
      expect.any(Function),
      { fit: "cover" },
    );
    expect(mocks.stitchLongrSequence).not.toHaveBeenCalled();
    expect(mocks.uploadBlobsToR2).toHaveBeenCalledWith([
      expect.objectContaining({
        kind: "video-clip-video",
        recordId: "generated_clip_1",
      }),
      expect.objectContaining({
        kind: "video-clip-poster",
        recordId: "generated_clip_1",
      }),
    ]);
    expect(getMutation("videoClips.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "generated_clip_1",
        name: "Swapr - Avatar in Source",
        posterObject: expect.objectContaining({
          key: "users/user_123/clips/generated_clip_1.jpg",
        }),
        swaprMetadata: expect.objectContaining({
          keepOriginalSound: true,
          prompt: "walk toward camera",
          replicatePredictionId: "prediction_1",
          replicatePredictionIds: ["prediction_1"],
          sourcePhotoId: "photo_1",
          sourceSegmentCount: 1,
        }),
      }),
    );
    expect(onClipSaved).toHaveBeenCalledTimes(1);
  });

  it("stitches multiple generated segments and tolerates poster failures", async () => {
    mocks.createId
      .mockReset()
      .mockReturnValueOnce("batch_1")
      .mockReturnValueOnce("segment_clip_1")
      .mockReturnValueOnce("segment_clip_2")
      .mockReturnValueOnce("generated_clip_1");
    mocks.createSwaprPrediction
      .mockResolvedValueOnce({
        id: "prediction_1",
        status: "queued",
      })
      .mockResolvedValueOnce({
        id: "prediction_2",
        status: "queued",
      });
    mocks.downloadSwaprPredictionOutputBlob
      .mockResolvedValueOnce(new Blob(["raw-1"], { type: "video/mp4" }))
      .mockResolvedValueOnce(new Blob(["raw-2"], { type: "video/mp4" }));
    mocks.normalizeUploadedVideo
      .mockResolvedValueOnce(createNormalizedResult("normalized-1", 5))
      .mockResolvedValueOnce(createNormalizedResult("normalized-2", 7));
    mocks.createVideoPosterBlob.mockRejectedValueOnce(new Error("no frame"));
    mocks.uploadBlobsToR2.mockResolvedValueOnce([
      {
        contentType: "video/mp4",
        key: "users/user_123/clips/generated_clip_1.mp4",
        size: 200,
      },
    ]);
    const state = useSwaprGeneration();

    await state.generate({
      characterOrientation: "video",
      clip: createClip(),
      keepOriginalSound: false,
      mode: "std",
      photo: createPhoto(),
      prompt: " ",
      referenceVideoSegments: [createSegment(0), createSegment(1)],
    });

    expect(mocks.stitchLongrSequence).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          clip: expect.objectContaining({ id: "segment_clip_1" }),
        }),
        expect.objectContaining({
          clip: expect.objectContaining({ id: "segment_clip_2" }),
        }),
      ],
      { onProgress: expect.any(Function) },
    );
    expect(mocks.uploadBlobsToR2).toHaveBeenCalledWith([
      expect.objectContaining({
        kind: "video-clip-video",
        recordId: "generated_clip_1",
      }),
    ]);
    expect(getMutation("videoClips.save")).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 12,
        originalSize: 10,
        posterObject: undefined,
        posterVersion: undefined,
        sourceMimeType: "video/mp4",
        swaprMetadata: expect.objectContaining({
          prompt: undefined,
          replicatePredictionIds: ["prediction_1", "prediction_2"],
          sourceSegmentCount: 2,
        }),
      }),
    );
  });

  it("fails before provider work when no source segment is selected", async () => {
    const state = useSwaprGeneration();

    await state.generate({
      characterOrientation: "image",
      clip: createClip(),
      keepOriginalSound: true,
      mode: "pro",
      photo: createPhoto(),
      prompt: "walk",
      referenceVideoSegments: [],
    });

    expect(mocks.createSwaprPrediction).not.toHaveBeenCalled();
    expect(getMutation("videoClips.save")).not.toHaveBeenCalled();
    expect(mocks.useStateSetter).toHaveBeenCalledWith("failed");
    expect(mocks.useStateSetter).toHaveBeenCalledWith(
      "Choose a source video before starting Swapr.",
    );
  });
});
