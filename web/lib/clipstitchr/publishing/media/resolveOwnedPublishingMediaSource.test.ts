import { describe, expect, it } from "vitest";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";
import { resolveOwnedPublishingMediaSource } from "@/lib/clipstitchr/publishing/media/resolveOwnedPublishingMediaSource";

const stitchMedia = {
  audioCodec: "aac",
  checksum: "sha256:abc123",
  contentType: "video/mp4; codecs=avc1",
  durationSeconds: 12,
  hasAudio: true,
  height: 1920,
  objectKey: "users/user_123/stitches/stitch_123/video.mp4",
  sizeBytes: 8_000_000,
  videoCodec: "H264",
  width: 1080,
};

const stitchRecord = {
  durability: "durable" as const,
  kind: "stitch" as const,
  mediaObjects: [stitchMedia],
  ownerId: "user_123",
  recordId: "stitch_123",
};

describe("resolveOwnedPublishingMediaSource", () => {
  it("resolves a server-owned durable Stitch and normalizes media metadata", () => {
    expect(
      resolveOwnedPublishingMediaSource({
        descriptor: { kind: "stitch", recordId: "stitch_123" },
        ownerId: "user_123",
        record: stitchRecord,
      }),
    ).toEqual({
      kind: "stitch",
      mediaObjects: [
        expect.objectContaining({
          checksum: "sha256:abc123",
          contentType: "video/mp4",
          videoCodec: "h264",
        }),
      ],
      ownerId: "user_123",
      recordId: "stitch_123",
    });
  });

  it("denies a cross-user record before it can be signed", () => {
    expect(() =>
      resolveOwnedPublishingMediaSource({
        descriptor: { kind: "stitch", recordId: "stitch_123" },
        ownerId: "user_456",
        record: stitchRecord,
      }),
    ).toThrowError(
      expect.objectContaining<Partial<PublishingMediaValidationError>>({
        code: "owner_mismatch",
      }),
    );
  });

  it("rejects a same-owner key tampered to point at another record", () => {
    expect(() =>
      resolveOwnedPublishingMediaSource({
        descriptor: { kind: "stitch", recordId: "stitch_123" },
        ownerId: "user_123",
        record: {
          ...stitchRecord,
          mediaObjects: [
            {
              ...stitchMedia,
              objectKey: "users/user_123/stitches/stitch_999/video.mp4",
            },
          ],
        },
      }),
    ).toThrowError(
      expect.objectContaining<Partial<PublishingMediaValidationError>>({
        code: "invalid_object_key",
      }),
    );
  });

  it("rejects arbitrary keys and browser URLs even in a server record", () => {
    for (const objectKey of [
      "provider-uploads/stitch_123/video.mp4",
      "blob:https://clipstitchr.com/local-video",
    ]) {
      expect(() =>
        resolveOwnedPublishingMediaSource({
          descriptor: { kind: "stitch", recordId: "stitch_123" },
          ownerId: "user_123",
          record: {
            ...stitchRecord,
            mediaObjects: [{ ...stitchMedia, objectKey }],
          },
        }),
      ).toThrow(PublishingMediaValidationError);
    }
  });

  it("requires an immutable object version or checksum", () => {
    expect(() =>
      resolveOwnedPublishingMediaSource({
        descriptor: { kind: "stitch", recordId: "stitch_123" },
        ownerId: "user_123",
        record: {
          ...stitchRecord,
          mediaObjects: [
            { ...stitchMedia, checksum: undefined, version: undefined },
          ],
        },
      }),
    ).toThrowError(
      expect.objectContaining<Partial<PublishingMediaValidationError>>({
        code: "missing_immutable_identity",
      }),
    );
  });

  it("supports a durably persisted saved Swipe artifact", () => {
    const mediaObjects = Array.from({ length: 3 }, (_, index) => ({
      checksum: `sha256:slide-${index + 1}`,
      contentType: "image/jpeg",
      height: 1920,
      objectKey: `users/user_123/swipes/swipe_123/publishing/revision/slide-${String(index + 1).padStart(2, "0")}.jpg`,
      sizeBytes: 1_200_000 + index,
      width: 1080,
    }));

    expect(
      resolveOwnedPublishingMediaSource({
        descriptor: { kind: "swipe", recordId: "swipe_123" },
        ownerId: "user_123",
        record: {
          durability: "durable",
          kind: "swipe",
          mediaObjects,
          ownerId: "user_123",
          recordId: "swipe_123",
        },
      }).kind,
    ).toBe("swipe");
  });

  it("supports a Product-owned Library photo as durable image media", () => {
    expect(
      resolveOwnedPublishingMediaSource({
        descriptor: { kind: "library-media", recordId: "photo_123" },
        ownerId: "user_123",
        record: {
          durability: "durable",
          kind: "library-media",
          mediaObjects: [
            {
              checksum: "sha256:photo",
              contentType: "image/jpeg",
              height: 720,
              objectKey: "users/user_123/photos/photo_123/photo.jpg",
              sizeBytes: 1_500_000,
              width: 1280,
            },
          ],
          ownerId: "user_123",
          recordId: "photo_123",
        },
      }),
    ).toMatchObject({
      kind: "library-media",
      mediaObjects: [{ contentType: "image/jpeg" }],
      recordId: "photo_123",
    });
  });

  it("rejects a single Swipe poster as an incomplete carousel", () => {
    expect(() =>
      resolveOwnedPublishingMediaSource({
        descriptor: { kind: "swipe", recordId: "swipe_123" },
        ownerId: "user_123",
        record: {
          durability: "durable",
          kind: "swipe",
          mediaObjects: [
            {
              contentType: "image/png",
              objectKey: "users/user_123/swipes/swipe_123/poster.png",
              sizeBytes: 1_200_000,
              version: "etag-poster-1",
            },
          ],
          ownerId: "user_123",
          recordId: "swipe_123",
        },
      }),
    ).toThrowError(
      expect.objectContaining<Partial<PublishingMediaValidationError>>({
        code: "invalid_metadata",
      }),
    );
  });
});
