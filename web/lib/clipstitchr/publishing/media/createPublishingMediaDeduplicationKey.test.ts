import { describe, expect, it } from "vitest";
import { createPublishingMediaDeduplicationKey } from "@/lib/clipstitchr/publishing/media/createPublishingMediaDeduplicationKey";
import type { ResolvedPublishingMediaSource } from "@/lib/clipstitchr/publishing/media/ResolvedPublishingMediaSource";

const source: ResolvedPublishingMediaSource = {
  kind: "stitch",
  mediaObjects: [
    {
      checksum: "sha256:abc123",
      contentType: "video/mp4",
      objectKey: "users/user_123/stitches/stitch_123/video.mp4",
      sizeBytes: 8_000_000,
      version: "etag-1",
    },
  ],
  ownerId: "user_123",
  recordId: "stitch_123",
};

describe("createPublishingMediaDeduplicationKey", () => {
  it("returns the same tenant-scoped identity for duplicate source input", () => {
    const first = createPublishingMediaDeduplicationKey(
      "clerk:user:user_123",
      source,
    );
    const duplicate = createPublishingMediaDeduplicationKey(
      "clerk:user:user_123",
      structuredClone(source),
    );

    expect(first).toBe(duplicate);
    expect(first).toMatch(/^publishing-media:v1:[a-f0-9]{64}$/);
    expect(first).not.toContain(source.mediaObjects[0].objectKey);
  });

  it("changes when the tenant, object version, or checksum changes", () => {
    const baseline = createPublishingMediaDeduplicationKey(
      "clerk:user:user_123",
      source,
    );
    const otherTenant = createPublishingMediaDeduplicationKey(
      "clerk:organization:org_456",
      source,
    );
    const otherVersion = createPublishingMediaDeduplicationKey(
      "clerk:user:user_123",
      {
        ...source,
        mediaObjects: [
          { ...source.mediaObjects[0], checksum: "sha256:def456", version: "etag-2" },
        ],
      },
    );

    expect(otherTenant).not.toBe(baseline);
    expect(otherVersion).not.toBe(baseline);
  });
});
