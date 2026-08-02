import {
  HeadObjectCommand,
  type HeadObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { describe, expect, it, vi } from "vitest";
import { enrichPublishingMediaObjectWithR2Head } from "@/lib/clipstitchr/publishing/media/server/enrichPublishingMediaObjectWithR2Head";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";

const mediaObject = {
  contentType: "video/mp4",
  durationSeconds: 12,
  height: 1920,
  objectKey: "users/user_123/stitches/stitch_123/video.mp4",
  sizeBytes: 8_000_000,
  width: 1080,
};

const headOutput: HeadObjectCommandOutput = {
  $metadata: {},
  ChecksumSHA256: "base64-checksum",
  ContentLength: 8_000_000,
  ContentType: "video/mp4",
  ETag: '"etag-123"',
  VersionId: "r2-version-1",
};

describe("enrichPublishingMediaObjectWithR2Head", () => {
  it("verifies R2 metadata and records version, ETag, and checksum identity", async () => {
    const send = vi.fn(
      async (command: HeadObjectCommand): Promise<HeadObjectCommandOutput> => {
        expect(command).toBeInstanceOf(HeadObjectCommand);
        return headOutput;
      },
    );

    await expect(
      enrichPublishingMediaObjectWithR2Head({
        bucketName: "clipstitchr-media",
        descriptor: { kind: "stitch", recordId: "stitch_123" },
        headClient: { send },
        mediaObject,
        ownerId: "user_123",
      }),
    ).resolves.toEqual({
      ...mediaObject,
      checksum: "sha256:base64-checksum",
      version: 'version:r2-version-1|etag:"etag-123"',
    });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0].input).toEqual({
      Bucket: "clipstitchr-media",
      Key: mediaObject.objectKey,
    });
  });

  it("turns a missing R2 object into a bounded validation error", async () => {
    const send = vi.fn(async () => {
      throw new Error("NoSuchKey: internal bucket detail");
    });

    await expect(
      enrichPublishingMediaObjectWithR2Head({
        bucketName: "clipstitchr-media",
        descriptor: { kind: "stitch", recordId: "stitch_123" },
        headClient: { send },
        mediaObject,
        ownerId: "user_123",
      }),
    ).rejects.toThrow("could not be found in durable storage");
  });

  it("rejects exact byte-size and content-type mismatches", async () => {
    for (const output of [
      { ...headOutput, ContentLength: 7_999_999 },
      { ...headOutput, ContentType: "video/quicktime" },
    ]) {
      await expect(
        enrichPublishingMediaObjectWithR2Head({
          bucketName: "clipstitchr-media",
          descriptor: { kind: "stitch", recordId: "stitch_123" },
          headClient: { send: vi.fn(async () => output) },
          mediaObject,
          ownerId: "user_123",
        }),
      ).rejects.toThrow(/no longer matches/);
    }
  });

  it("requires an immutable R2 version, ETag, or checksum", async () => {
    await expect(
      enrichPublishingMediaObjectWithR2Head({
        bucketName: "clipstitchr-media",
        descriptor: { kind: "stitch", recordId: "stitch_123" },
        headClient: {
          send: vi.fn(async () => ({
            $metadata: {},
            ContentLength: 8_000_000,
            ContentType: "video/mp4",
          })),
        },
        mediaObject,
        ownerId: "user_123",
      }),
    ).rejects.toThrowError(
      expect.objectContaining<Partial<PublishingMediaValidationError>>({
        code: "missing_immutable_identity",
      }),
    );
  });

  it("rejects a saved checksum or version that no longer matches R2", async () => {
    for (const persistedIdentity of [
      { checksum: "sha256:different" },
      { version: 'etag:"different"' },
    ]) {
      await expect(
        enrichPublishingMediaObjectWithR2Head({
          bucketName: "clipstitchr-media",
          descriptor: { kind: "stitch", recordId: "stitch_123" },
          headClient: { send: vi.fn(async () => headOutput) },
          mediaObject: { ...mediaObject, ...persistedIdentity },
          ownerId: "user_123",
        }),
      ).rejects.toThrow(/no longer matches/);
    }
  });

  it("verifies the signed checksum from durable R2 metadata", async () => {
    await expect(
      enrichPublishingMediaObjectWithR2Head({
        bucketName: "clipstitchr-media",
        descriptor: { kind: "stitch", recordId: "stitch_123" },
        headClient: {
          send: vi.fn(async () => ({
            $metadata: {},
            ContentLength: 8_000_000,
            ContentType: "video/mp4",
            ETag: '"etag-123"',
            Metadata: { "checksum-sha256": "saved-checksum" },
          })),
        },
        mediaObject: {
          ...mediaObject,
          checksum: "sha256:saved-checksum",
        },
        ownerId: "user_123",
      }),
    ).resolves.toEqual(
      expect.objectContaining({ checksum: "sha256:saved-checksum" }),
    );
  });

  it("denies cross-user and tampered keys before contacting R2", async () => {
    for (const [ownerId, objectKey] of [
      ["user_456", mediaObject.objectKey],
      ["user_123", "users/user_123/stitches/stitch_999/video.mp4"],
    ] as const) {
      const send = vi.fn(async () => headOutput);

      await expect(
        enrichPublishingMediaObjectWithR2Head({
          bucketName: "clipstitchr-media",
          descriptor: { kind: "stitch", recordId: "stitch_123" },
          headClient: { send },
          mediaObject: { ...mediaObject, objectKey },
          ownerId,
        }),
      ).rejects.toThrow(PublishingMediaValidationError);
      expect(send).not.toHaveBeenCalled();
    }
  });
});
