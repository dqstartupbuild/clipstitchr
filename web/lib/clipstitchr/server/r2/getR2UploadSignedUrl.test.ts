import { beforeEach, describe, expect, it, vi } from "vitest";
import { getR2UploadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2UploadSignedUrl";

const mocks = vi.hoisted(() => ({
  getSignedUrl: vi.fn(),
  putObjectCommand: vi.fn(function (input: unknown) {
    return { input };
  }),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  PutObjectCommand: mocks.putObjectCommand,
}));
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: mocks.getSignedUrl,
}));
vi.mock("@/lib/clipstitchr/server/r2/createR2Client", () => ({
  createR2Client: () => ({ client: true }),
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2Environment", () => ({
  getR2Environment: () => ({ bucketName: "bucket" }),
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2SignedUrlExpiresSeconds", () => ({
  getR2SignedUrlExpiresSeconds: () => 300,
}));

describe("getR2UploadSignedUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSignedUrl.mockResolvedValue("https://r2.example/upload");
  });

  it("binds the checksum validator and durable checksum metadata into the signature", async () => {
    const checksumSha256 = `${"A".repeat(43)}=`;

    await expect(
      getR2UploadSignedUrl({
        checksumSha256,
        contentLength: 123,
        contentType: "image/png",
        key: "users/user_123/swipes/swipe_123/slide.png",
        preventOverwrite: true,
      }),
    ).resolves.toEqual({
      expiresIn: 300,
      url: "https://r2.example/upload",
    });
    expect(mocks.putObjectCommand).toHaveBeenCalledWith({
      Bucket: "bucket",
      ChecksumSHA256: checksumSha256,
      ContentLength: 123,
      ContentType: "image/png",
      IfNoneMatch: "*",
      Key: "users/user_123/swipes/swipe_123/slide.png",
      Metadata: {
        "checksum-sha256": checksumSha256,
      },
    });
  });
});
