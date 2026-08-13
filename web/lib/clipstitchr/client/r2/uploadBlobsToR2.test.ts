import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";

const mocks = vi.hoisted(() => ({
  createR2UploadUrl: vi.fn(),
  putBlobToR2: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/client/r2/createR2UploadUrl", () => ({
  createR2UploadUrl: mocks.createR2UploadUrl,
}));

vi.mock("@/lib/clipstitchr/client/r2/putBlobToR2", () => ({
  putBlobToR2: mocks.putBlobToR2,
}));

describe("uploadBlobsToR2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createR2UploadUrl.mockResolvedValue({
      contentType: "video/mp4",
      key: "users/user_123/stitches/stitch_123/video.mp4",
      size: 12,
      url: "https://upload.example/video",
    });
    mocks.putBlobToR2.mockResolvedValue({
      contentType: "video/mp4",
      etag: '"etag-1"',
      key: "users/user_123/stitches/stitch_123/video.mp4",
      size: 12,
      versionId: "version-1",
    });
  });

  it("returns exact legacy object references after uploading", async () => {
    await expect(
      uploadBlobsToR2([
        {
          blob: new Blob(["test content"]),
          kind: "stitch-video",
          recordId: "stitch_123",
        },
      ]),
    ).resolves.toEqual([
      {
        contentType: "video/mp4",
        key: "users/user_123/stitches/stitch_123/video.mp4",
        size: 12,
      },
    ]);
  });
});
