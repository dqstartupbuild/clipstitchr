import { describe, expect, it, vi } from "vitest";
import type { HeadObjectCommandOutput } from "@aws-sdk/client-s3";
import { signPublishingMediaJustInTime } from "@/lib/clipstitchr/publishing/media/signPublishingMediaJustInTime";
import type { ResolvedPublishingMediaSource } from "@/lib/clipstitchr/publishing/media/ResolvedPublishingMediaSource";

const nowEpochMs = Date.UTC(2026, 7, 2, 12, 0, 0);
const source: ResolvedPublishingMediaSource = {
  kind: "library-media",
  mediaObjects: [
    {
      checksum: "sha256:clip",
      contentType: "video/mp4",
      objectKey: "users/user_123/video-clips/clip_123/video.mp4",
      sizeBytes: 4_000_000,
    },
  ],
  ownerId: "user_123",
  recordId: "clip_123",
};

function createHeadClient(checksumSha256 = "clip") {
  return {
    send: vi.fn(
      async (): Promise<HeadObjectCommandOutput> => ({
        $metadata: {},
        ContentLength: 4_000_000,
        ContentType: "video/mp4",
        ETag: '"etag-clip"',
        Metadata: { "checksum-sha256": checksumSha256 },
      }),
    ),
  };
}

describe("signPublishingMediaJustInTime", () => {
  it("invokes the signer at fetch time and does not add a URL to durable source data", async () => {
    const sign = vi.fn(async () => ({
      expiresAtEpochMs: nowEpochMs + 75 * 60 * 1000,
      supportsNoRedirectFetch: true,
      supportsGet: true,
      supportsHead: true,
      supportsRange: true,
      url: "https://media.clipstitchr.com/video.mp4?X-Amz-Signature=secret",
    }));
    const headClient = createHeadClient();

    expect("url" in source.mediaObjects[0]).toBe(false);

    const firstGrants = await signPublishingMediaJustInTime({
      bucketName: "clipstitchr-media",
      headClient,
      nowEpochMs,
      provider: "tiktok",
      quotaIdentity: "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      signer: { sign },
      source,
      verifiedClipStitchrOrigin: "https://media.clipstitchr.com",
    });
    await signPublishingMediaJustInTime({
      bucketName: "clipstitchr-media",
      headClient,
      nowEpochMs,
      provider: "tiktok",
      quotaIdentity: "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      signer: { sign },
      source,
      verifiedClipStitchrOrigin: "https://media.clipstitchr.com",
    });

    expect(sign).toHaveBeenCalledTimes(2);
    expect(sign).toHaveBeenCalledWith({
      checksum: "sha256:clip",
      contentType: "video/mp4",
      objectKey: source.mediaObjects[0].objectKey,
      provider: "tiktok",
      quotaIdentity: "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      requestedValiditySeconds: 4500,
      sizeBytes: 4_000_000,
      version: 'etag:"etag-clip"',
    });
    expect(headClient.send).toHaveBeenCalledTimes(2);
    expect(firstGrants[0].url).toContain("X-Amz-Signature");
    expect("url" in source.mediaObjects[0]).toBe(false);
  });

  it("rejects a signer response that is already too transient", async () => {
    await expect(
      signPublishingMediaJustInTime({
        bucketName: "clipstitchr-media",
        headClient: createHeadClient(),
        nowEpochMs,
        provider: "instagram",
        quotaIdentity: "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        signer: {
          sign: vi.fn(async () => ({
            expiresAtEpochMs: nowEpochMs + 30_000,
            supportsNoRedirectFetch: true,
            supportsGet: true,
            supportsHead: true,
            supportsRange: true,
            url: "https://media.clipstitchr.com/video.mp4?X-Amz-Signature=secret",
          })),
        },
        source,
        verifiedClipStitchrOrigin: "https://media.clipstitchr.com",
      }),
    ).rejects.toThrow("expires too soon");
  });

  it("rejects an object overwritten after resolution before minting a URL", async () => {
    const sign = vi.fn();

    await expect(
      signPublishingMediaJustInTime({
        bucketName: "clipstitchr-media",
        headClient: createHeadClient("overwritten"),
        nowEpochMs,
        provider: "instagram",
        quotaIdentity: "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        signer: { sign },
        source,
        verifiedClipStitchrOrigin: "https://media.clipstitchr.com",
      }),
    ).rejects.toThrow("checksum no longer matches");
    expect(sign).not.toHaveBeenCalled();
  });
});
