import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createPublishingResolvedMediaManifest } from "@/lib/clipstitchr/publishing/api/createPublishingResolvedMediaManifest";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";
import type { ResolvedPublishingMediaSource } from "@/lib/clipstitchr/publishing/media/ResolvedPublishingMediaSource";

const source: ResolvedPublishingMediaSource = {
  kind: "library-media",
  mediaObjects: [
    {
      checksum: "sha256:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
      contentType: "video/mp4",
      durationSeconds: 12.5,
      hasAudio: true,
      height: 1_920,
      objectKey: "users/user_123/library/media_123/video.mp4",
      sizeBytes: 98_765,
      version: 'version:v1|etag:"etag-1"',
      videoCodec: "h264",
      width: 1_080,
    },
  ],
  ownerId: "user_123",
  recordId: "media_123",
};

describe("createPublishingResolvedMediaManifest", () => {
  it("creates stable service hashes and normalizes the library source kind", () => {
    const first = createPublishingResolvedMediaManifest(source);
    const second = createPublishingResolvedMediaManifest(source);

    expect(first).toEqual(second);
    expect(first.sourceKind).toBe("library");
    expect(first.contentChecksum).toMatch(/^[a-f0-9]{64}$/u);
    expect(first.sourceRevision).toMatch(/^[a-f0-9]{64}$/u);
    expect(first.objects).toEqual([
      {
        byteLength: 98_765,
        checksum: "0".repeat(64),
        contentType: "video/mp4",
        durationSeconds: 12.5,
        hasAudio: true,
        height: 1_920,
        objectKey: "users/user_123/library/media_123/video.mp4",
        objectVersion: 'version:v1|etag:"etag-1"',
        orderedIndex: 0,
        videoCodec: "h264",
        width: 1_080,
      },
    ]);
    expect(first).not.toHaveProperty("ownerId");
  });

  it("rejects an object without its required checksum", () => {
    expect(() =>
      createPublishingResolvedMediaManifest({
        ...source,
        mediaObjects: [{ ...source.mediaObjects[0], checksum: undefined }],
      }),
    ).toThrow(PublishingMediaValidationError);
  });
});
