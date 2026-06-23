import { beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeNormalizedVideoUpload } from "@/lib/clipstitchr/client/analyzeNormalizedVideoUpload";

const mocks = vi.hoisted(() => ({
  analyzeUploadAsset: vi.fn(),
  createR2DownloadUrl: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/client/analyzeUploadAsset", () => ({
  analyzeUploadAsset: mocks.analyzeUploadAsset,
}));

vi.mock("@/lib/clipstitchr/client/r2/createR2DownloadUrl", () => ({
  createR2DownloadUrl: mocks.createR2DownloadUrl,
}));

describe("analyzeNormalizedVideoUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createR2DownloadUrl.mockResolvedValue({
      expiresIn: 900,
      url: "https://r2.example/signed-video.mp4",
    });
    mocks.analyzeUploadAsset.mockResolvedValue({
      name: "Analyzed clip",
      tags: ["ugc"],
    });
  });

  it("analyzes normalized UGC videos through the signed R2 URL", async () => {
    const posterBlob = new Blob(["poster"], { type: "image/jpeg" });
    const videoObject = {
      contentType: "video/mp4",
      key: "users/user_123/video-clips/clip_1/video.mp4",
      size: 100,
    };

    await expect(
      analyzeNormalizedVideoUpload({
        clipType: "ugc",
        originalName: "source.mov",
        posterBlob,
        videoObject,
      }),
    ).resolves.toEqual({
      name: "Analyzed clip",
      tags: ["ugc"],
    });
    expect(mocks.createR2DownloadUrl).toHaveBeenCalledWith(videoObject);
    expect(mocks.analyzeUploadAsset).toHaveBeenCalledWith({
      fallbackBlob: posterBlob,
      mediaKind: "ugc-video",
      originalName: "source.mov",
      sourceSizeBytes: 100,
      sourceUrl: "https://r2.example/signed-video.mp4",
    });
  });

  it("uses demo video analysis for product demo uploads", async () => {
    await analyzeNormalizedVideoUpload({
      clipType: "demo",
      originalName: "demo.mov",
      posterBlob: new Blob(["poster"], { type: "image/jpeg" }),
      videoObject: {
        contentType: "video/mp4",
        key: "video.mp4",
        size: 100,
      },
    });

    expect(mocks.analyzeUploadAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaKind: "demo-video",
      }),
    );
  });
});
