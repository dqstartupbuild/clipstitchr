import type { ConvexHttpClient } from "convex/browser";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resolvePublishingApiDestinations } from "@/lib/clipstitchr/publishing/api/resolvePublishingApiDestinations";

const mocks = vi.hoisted(() => ({
  resolvePublishingApiMedia: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/publishing/api/resolvePublishingApiMedia",
  () => ({ resolvePublishingApiMedia: mocks.resolvePublishingApiMedia }),
);

const thumbnailRevision = "a".repeat(64);
const thumbnailManifest = Object.freeze({
  contentChecksum: "b".repeat(64),
  objects: Object.freeze([
    Object.freeze({
      byteLength: 1_500_000,
      checksum: "c".repeat(64),
      contentType: "image/jpeg",
      height: 720,
      objectKey: "users/user_123/photos/photo_123/photo.jpg",
      objectVersion: 'etag:"thumbnail"',
      orderedIndex: 0,
      width: 1_280,
    }),
  ]),
  sourceKind: "library" as const,
  sourceRecordId: "photo_123",
  sourceRevision: thumbnailRevision,
});

describe("resolvePublishingApiDestinations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolvePublishingApiMedia.mockResolvedValue({
      manifest: thumbnailManifest,
      mediaObjects: [],
    });
  });

  it("replaces an owned thumbnail selection with its immutable manifest", async () => {
    const convex = {} as ConvexHttpClient;
    const result = await resolvePublishingApiDestinations({
      convex,
      destinations: [
        {
          integrationId: "youtube_123",
          provider: "youtube",
          settings: {
            madeForKids: false,
            thumbnail: {
              media: { kind: "library-media", recordId: "photo_123" },
              mediaRevision: thumbnailRevision,
            },
            title: "A useful title",
            visibility: "unlisted",
          },
        },
      ],
      productId: "product_123",
    });

    expect(mocks.resolvePublishingApiMedia).toHaveBeenCalledWith({
      convex,
      descriptor: { kind: "library-media", recordId: "photo_123" },
      productId: "product_123",
    });
    expect(result).toEqual([
      {
        integrationId: "youtube_123",
        provider: "youtube",
        settings: {
          madeForKids: false,
          thumbnail: thumbnailManifest,
          title: "A useful title",
          visibility: "unlisted",
        },
      },
    ]);
    expect(JSON.stringify(result)).not.toContain("mediaRevision");
  });

  it("deduplicates the same thumbnail across YouTube destinations", async () => {
    const thumbnail = {
      media: { kind: "library-media" as const, recordId: "photo_123" },
      mediaRevision: thumbnailRevision,
    };
    await resolvePublishingApiDestinations({
      convex: {} as ConvexHttpClient,
      destinations: ["one", "two"].map((integrationId) => ({
        integrationId,
        provider: "youtube" as const,
        settings: {
          madeForKids: false,
          thumbnail,
          title: "A useful title",
          visibility: "private" as const,
        },
      })),
      productId: "product_123",
    });

    expect(mocks.resolvePublishingApiMedia).toHaveBeenCalledOnce();
  });

  it("fails closed for a stale or oversized thumbnail", async () => {
    const destination = {
      integrationId: "youtube_123",
      provider: "youtube" as const,
      settings: {
        madeForKids: false,
        thumbnail: {
          media: { kind: "library-media" as const, recordId: "photo_123" },
          mediaRevision: thumbnailRevision,
        },
        title: "A useful title",
        visibility: "private" as const,
      },
    };
    mocks.resolvePublishingApiMedia.mockResolvedValueOnce({
      manifest: { ...thumbnailManifest, sourceRevision: "d".repeat(64) },
      mediaObjects: [],
    });
    await expect(
      resolvePublishingApiDestinations({
        convex: {} as ConvexHttpClient,
        destinations: [destination],
        productId: "product_123",
      }),
    ).rejects.toMatchObject({ code: "stale_thumbnail_revision", status: 409 });

    mocks.resolvePublishingApiMedia.mockResolvedValueOnce({
      manifest: {
        ...thumbnailManifest,
        objects: [
          { ...thumbnailManifest.objects[0], byteLength: 2_097_153 },
        ],
      },
      mediaObjects: [],
    });
    await expect(
      resolvePublishingApiDestinations({
        convex: {} as ConvexHttpClient,
        destinations: [destination],
        productId: "product_123",
      }),
    ).rejects.toMatchObject({ code: "invalid_youtube_thumbnail", status: 422 });
  });
});
