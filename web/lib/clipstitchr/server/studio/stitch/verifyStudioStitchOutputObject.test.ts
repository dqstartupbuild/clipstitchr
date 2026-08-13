import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyStudioStitchOutputObject } from "./verifyStudioStitchOutputObject";

const mocks = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/clipstitchr/server/r2/createR2Client", () => ({
  createR2Client: () => ({ send: mocks.send }),
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2Environment", () => ({
  getR2Environment: () => ({ bucketName: "private-bucket" }),
}));

const output = {
  audioCodec: "aac",
  byteLength: 100,
  contentType: "video/mp4",
  durationSeconds: 12,
  hasAudio: true,
  height: 1920,
  objectKey: "users/user_1/studio/output.mp4",
  ownerId: "user_1",
  objectVersion: "version-12345678",
  sha256: "a".repeat(64),
  videoCodec: "h264",
  width: 1080,
};

describe("verifyStudioStitchOutputObject", () => {
  beforeEach(() => {
    mocks.send.mockReset();
    mocks.send.mockResolvedValue({
      ChecksumSHA256: Buffer.from(output.sha256, "hex").toString("base64"),
      ContentLength: output.byteLength,
      ContentType: output.contentType,
      VersionId: output.objectVersion,
    });
  });

  it("matches the immutable R2 identity to worker-probed facts", async () => {
    await expect(verifyStudioStitchOutputObject(output)).resolves.toEqual(
      expect.objectContaining({
        objectKey: output.objectKey,
        sha256: output.sha256,
      }),
    );
    expect(mocks.send.mock.calls[0][0]).toBeInstanceOf(HeadObjectCommand);
  });

  it("rejects changed checksum or version before Library persistence", async () => {
    mocks.send.mockResolvedValue({
      ChecksumSHA256: Buffer.from("b".repeat(64), "hex").toString("base64"),
      ContentLength: output.byteLength,
      ContentType: output.contentType,
      VersionId: "different-version",
    });
    await expect(verifyStudioStitchOutputObject(output)).rejects.toThrow(
      "no longer matches",
    );
  });
});
