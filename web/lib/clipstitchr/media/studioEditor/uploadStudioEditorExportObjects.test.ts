import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadStudioEditorExportObjects } from "@/lib/clipstitchr/media/studioEditor/uploadStudioEditorExportObjects";

const mocks = vi.hoisted(() => ({
  createVideoPosterBlob: vi.fn(),
  deleteObjectsFromR2: vi.fn(),
  uploadStudioBetaBlobToR2: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/client/r2/deleteObjectsFromR2", () => ({
  deleteObjectsFromR2: mocks.deleteObjectsFromR2,
}));

vi.mock("@/lib/clipstitchr/client/r2/uploadStudioBetaBlobToR2", () => ({
  uploadStudioBetaBlobToR2: mocks.uploadStudioBetaBlobToR2,
}));

vi.mock("@/lib/clipstitchr/media/createVideoPosterBlob", () => ({
  createVideoPosterBlob: mocks.createVideoPosterBlob,
}));

describe("uploadStudioEditorExportObjects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createVideoPosterBlob.mockResolvedValue(
      new Blob(["poster"], { type: "image/jpeg" }),
    );
    mocks.uploadStudioBetaBlobToR2
      .mockResolvedValueOnce({
        contentType: "video/mp4",
        etag: '"video-etag"',
        key: "users/user_123/studio/v1/media-output/product_1/clip_1/video.mp4",
        size: 5,
        versionId: "video-version",
      })
      .mockResolvedValueOnce({
        contentType: "image/jpeg",
        etag: '"poster-etag"',
        key: "users/user_123/studio/v1/poster/product_1/clip_1-poster/poster.jpg",
        size: 6,
        versionId: "poster-version",
      });
  });

  it("returns exact classic Library object references", async () => {
    await expect(
      uploadStudioEditorExportObjects({
        clipId: "clip_1",
        productId: "product_1",
        videoBlob: new Blob(["video"], { type: "video/mp4" }),
      }),
    ).resolves.toEqual({
      posterObject: {
        contentType: "image/jpeg",
        key: "users/user_123/studio/v1/poster/product_1/clip_1-poster/poster.jpg",
        size: 6,
      },
      videoObject: {
        contentType: "video/mp4",
        key: "users/user_123/studio/v1/media-output/product_1/clip_1/video.mp4",
        size: 5,
      },
    });
  });
});
