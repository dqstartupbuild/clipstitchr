import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTemporarySwaprReferenceVideoSegments } from "@/lib/clipstitchr/client/createTemporarySwaprReferenceVideoSegments";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

const mocks = vi.hoisted(() => ({
  createVideoSegmentBlob: vi.fn(),
  deleteObjectsFromR2: vi.fn(),
  uploadBlobsToR2: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/client/r2/deleteObjectsFromR2", () => ({
  deleteObjectsFromR2: mocks.deleteObjectsFromR2,
}));

vi.mock("@/lib/clipstitchr/client/r2/uploadBlobsToR2", () => ({
  uploadBlobsToR2: mocks.uploadBlobsToR2,
}));

vi.mock("@/lib/clipstitchr/media/createVideoSegmentBlob", () => ({
  createVideoSegmentBlob: mocks.createVideoSegmentBlob,
}));

function createClip(): VideoClip {
  return {
    aspectRatio: 9 / 16,
    blob: new Blob(["source"], { type: "video/mp4" }),
    clipType: "ugc",
    createdAt: "2026-01-01T00:00:00.000Z",
    duration: 14,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    mimeType: "video/mp4",
    name: "UGC clip",
    originalName: "ugc.mp4",
    originalSize: 100,
    size: 100,
    sourceMimeType: "video/mp4",
    updatedAt: "2026-01-01T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: "users/user_1/video-clips/clip_1/video.mp4",
      size: 100,
    },
    width: 1080,
  };
}

describe("createTemporarySwaprReferenceVideoSegments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createVideoSegmentBlob.mockResolvedValue({
      blob: new Blob(["segment"], { type: "video/mp4" }),
    });
    mocks.uploadBlobsToR2.mockImplementation(async ([upload]) => [
      {
        contentType: upload.blob.type,
        key: `users/user_1/swapr/${upload.recordId}.mp4`,
        size: upload.blob.size,
      },
    ]);
    mocks.deleteObjectsFromR2.mockResolvedValue(undefined);
  });

  it("creates temporary R2 segments for each generated trim range", async () => {
    const sourceClip = createClip();
    const clip = sourceClip as VideoClipMetadata;

    const segments = await createTemporarySwaprReferenceVideoSegments({
      clip,
      segmentDurationLimit: 5,
      sourceClip,
    });

    expect(mocks.createVideoSegmentBlob).toHaveBeenCalledTimes(3);
    expect(mocks.createVideoSegmentBlob).toHaveBeenNthCalledWith(1, sourceClip, {
      trimRange: { end: 14 / 3, start: 0 },
    });
    expect(mocks.createVideoSegmentBlob).toHaveBeenNthCalledWith(3, sourceClip, {
      trimRange: { end: 14, start: 28 / 3 },
    });
    expect(mocks.uploadBlobsToR2).toHaveBeenCalledTimes(3);
    expect(segments).toHaveLength(3);
    expect(segments[0].duration).toBeCloseTo(14 / 3);
    expect(segments[1].duration).toBeCloseTo(14 / 3);
    expect(segments[2].duration).toBeCloseTo(14 / 3);
    expect(segments.every((segment) => segment.isTemporary)).toBe(true);
    expect(
      segments.every(
        (segment) => segment.videoObject.contentType === "video/mp4",
      ),
    ).toBe(true);
  });

  it("cleans up already uploaded temporary objects if a later segment fails", async () => {
    mocks.createVideoSegmentBlob
      .mockResolvedValueOnce({
        blob: new Blob(["first"], { type: "video/mp4" }),
      })
      .mockRejectedValueOnce(new Error("segment failed"));
    const sourceClip = createClip();

    await expect(
      createTemporarySwaprReferenceVideoSegments({
        clip: sourceClip as VideoClipMetadata,
        segmentDurationLimit: 5,
        sourceClip,
      }),
    ).rejects.toThrow("segment failed");
    expect(mocks.deleteObjectsFromR2).toHaveBeenCalledWith([
      expect.objectContaining({
        contentType: "video/mp4",
      }),
    ]);
  });
});
