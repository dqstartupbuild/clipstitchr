import { beforeEach, describe, expect, it, vi } from "vitest";
import { getR2UploadSignedUrl } from "./getR2UploadSignedUrl";

const mocks = vi.hoisted(() => ({
  client: {},
  getSignedUrl: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: mocks.getSignedUrl,
}));
vi.mock("@/lib/clipstitchr/server/r2/createR2Client", () => ({
  createR2Client: () => mocks.client,
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2Environment", () => ({
  getR2Environment: () => ({ bucketName: "studio-bucket" }),
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2SignedUrlExpiresSeconds", () => ({
  getR2SignedUrlExpiresSeconds: () => 300,
}));

describe("getR2UploadSignedUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSignedUrl.mockResolvedValue("https://r2.example/upload");
  });

  it("signs an exact content length when the caller supplies one", async () => {
    await expect(
      getR2UploadSignedUrl({
        contentType: "video/mp4",
        key: "users/owner/studio/v1/media-source/clip/video.mp4",
        sizeBytes: 1_024,
      }),
    ).resolves.toEqual({
      expiresIn: 300,
      url: "https://r2.example/upload",
    });

    const [, command, options] = mocks.getSignedUrl.mock.calls[0];
    expect(command.input).toMatchObject({
      Bucket: "studio-bucket",
      ContentLength: 1_024,
      ContentType: "video/mp4",
    });
    expect(options.signableHeaders).toEqual(new Set(["content-length"]));
  });

  it("rejects an invalid exact size before signing", async () => {
    await expect(
      getR2UploadSignedUrl({
        contentType: "video/mp4",
        key: "users/owner/studio/v1/media-source/clip/video.mp4",
        sizeBytes: 0,
      }),
    ).rejects.toThrow("upload size is invalid");
    expect(mocks.getSignedUrl).not.toHaveBeenCalled();
  });
});
