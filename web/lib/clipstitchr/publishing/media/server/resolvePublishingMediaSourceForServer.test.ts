import type { HeadObjectCommandOutput } from "@aws-sdk/client-s3";
import type { ConvexHttpClient } from "convex/browser";
import { describe, expect, it, vi } from "vitest";
import { resolvePublishingMediaSourceForServer } from "@/lib/clipstitchr/publishing/media/server/resolvePublishingMediaSourceForServer";

const durableRecord = {
  durability: "durable" as const,
  kind: "library-media" as const,
  mediaObjects: [
    {
      contentType: "video/mp4",
      durationSeconds: 9,
      hasAudio: true,
      height: 1920,
      objectKey: "users/user_123/video-clips/clip_123/video.mp4",
      sizeBytes: 4_000_000,
      width: 1080,
    },
  ],
  ownerId: "user_123",
  recordId: "clip_123",
};

const headOutput: HeadObjectCommandOutput = {
  $metadata: {},
  ContentLength: 4_000_000,
  ContentType: "video/mp4",
  ETag: '"etag-clip-123"',
};

describe("resolvePublishingMediaSourceForServer", () => {
  it("composes parsing, authenticated lookup, R2 HEAD, and ownership resolution", async () => {
    const mutation = vi.fn(async () => durableRecord);
    const send = vi.fn(
      async (): Promise<HeadObjectCommandOutput> => headOutput,
    );

    const resolved = await resolvePublishingMediaSourceForServer({
      bucketName: "clipstitchr-media",
      convex: { mutation } as unknown as ConvexHttpClient,
      descriptor: { kind: "library-media", recordId: "clip_123" },
      headClient: { send },
      productId: "product_1",
    });

    expect(mutation).toHaveBeenCalledWith(expect.anything(), {
      kind: "library-media",
      productId: "product_1",
      recordId: "clip_123",
    });
    expect(resolved).toEqual({
      kind: "library-media",
      mediaObjects: [
        {
          ...durableRecord.mediaObjects[0],
          version: 'etag:"etag-clip-123"',
        },
      ],
      ownerId: "user_123",
      recordId: "clip_123",
    });
    expect(JSON.stringify(resolved)).not.toContain("https://");
    expect(JSON.stringify(resolved)).not.toContain("signedUrl");
  });

  it("rejects client-supplied object keys before lookup or R2 work", async () => {
    const mutation = vi.fn();
    const send = vi.fn();

    await expect(
      resolvePublishingMediaSourceForServer({
        bucketName: "clipstitchr-media",
        convex: { mutation } as unknown as ConvexHttpClient,
        descriptor: {
          kind: "library-media",
          objectKey: durableRecord.mediaObjects[0].objectKey,
          recordId: "clip_123",
        },
        headClient: { send },
        productId: "product_1",
      }),
    ).rejects.toThrow("accepts only a saved item type and record ID");
    expect(mutation).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("does not contact R2 when the owner-scoped lookup returns no record", async () => {
    const send = vi.fn();

    await expect(
      resolvePublishingMediaSourceForServer({
        bucketName: "clipstitchr-media",
        convex: {
          mutation: vi.fn(async () => null),
        } as unknown as ConvexHttpClient,
        descriptor: { kind: "library-media", recordId: "clip_other" },
        headClient: { send },
        productId: "product_1",
      }),
    ).rejects.toThrow("unavailable or not ready");
    expect(send).not.toHaveBeenCalled();
  });
});
