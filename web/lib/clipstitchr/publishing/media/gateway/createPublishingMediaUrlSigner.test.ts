import type { HeadObjectCommandOutput } from "@aws-sdk/client-s3";
import { describe, expect, it, vi } from "vitest";
import { createPublishingMediaUrlSigner } from "@/lib/clipstitchr/publishing/media/gateway/createPublishingMediaUrlSigner";
import { verifyPublishingMediaGatewayToken } from "@/lib/clipstitchr/publishing/media/gateway/verifyPublishingMediaGatewayToken";

const nowEpochMs = Date.UTC(2026, 7, 2, 12, 0, 0);
const tokenSecret = "token-secret-that-is-at-least-thirty-two-bytes-long";
const request = {
  checksum: "sha256:checksum",
  contentType: "video/mp4",
  objectKey: "users/user_123/video-clips/clip_123/video.mp4",
  provider: "tiktok" as const,
  quotaIdentity: "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  requestedValiditySeconds: 4_500,
  sizeBytes: 8,
  version: 'version:r2-version-1|etag:"etag-1"',
};

function createHeadOutput(
  etag = '"etag-1"',
): HeadObjectCommandOutput {
  return {
    $metadata: {},
    ContentLength: 8,
    ContentType: "video/mp4",
    ETag: etag,
    Metadata: { "checksum-sha256": "checksum" },
    VersionId: "r2-version-1",
  };
}

describe("createPublishingMediaUrlSigner", () => {
  it("re-HEADs immediately and mints a gateway URL bound to exact object identity", async () => {
    const send = vi.fn(async () => createHeadOutput());
    const signer = createPublishingMediaUrlSigner({
      bucketName: "clipstitchr-media",
      createGrantKeyBytes: () => Buffer.alloc(16, 4),
      createInitializationVector: () => Buffer.alloc(12, 5),
      headClient: { send },
      nowEpochMs: () => nowEpochMs,
      publicOrigin: "https://media.clipstitchr.test",
      tokenSecret,
    });

    const grant = await signer.sign(request);
    const token = grant.url.split("/").at(-1);

    expect(send).toHaveBeenCalledTimes(1);
    expect(grant.url).toMatch(
      /^https:\/\/media\.clipstitchr\.test\/api\/studio\/publishing\/media\/v1\./,
    );
    expect(grant.url).not.toContain(request.objectKey);
    expect(grant.url).not.toContain("X-Amz");
    expect(
      verifyPublishingMediaGatewayToken(
        token ?? "",
        tokenSecret,
        "https://media.clipstitchr.test",
        nowEpochMs,
      ),
    ).toMatchObject({
      checksum: request.checksum,
      contentType: request.contentType,
      etag: '"etag-1"',
      objectKey: request.objectKey,
      sizeBytes: request.sizeBytes,
      versionId: "r2-version-1",
    });
  });

  it("rejects an object overwritten after source resolution", async () => {
    const signer = createPublishingMediaUrlSigner({
      bucketName: "clipstitchr-media",
      headClient: { send: vi.fn(async () => createHeadOutput('"etag-2"')) },
      nowEpochMs: () => nowEpochMs,
      publicOrigin: "https://media.clipstitchr.test",
      tokenSecret,
    });

    await expect(signer.sign(request)).rejects.toThrow(
      "changed before its fetch grant",
    );
  });

  it("rejects storage that cannot enforce VersionId or If-Match", async () => {
    const signer = createPublishingMediaUrlSigner({
      bucketName: "clipstitchr-media",
      headClient: {
        send: vi.fn(async () => ({
          ...createHeadOutput(),
          ETag: undefined,
          VersionId: undefined,
        })),
      },
      nowEpochMs: () => nowEpochMs,
      publicOrigin: "https://media.clipstitchr.test",
      tokenSecret,
    });

    await expect(
      signer.sign({ ...request, version: undefined }),
    ).rejects.toThrow("VersionId or ETag");
  });
});
