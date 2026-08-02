import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "./getOwnedPublishingMediaRecord";
import { createSwipePublishingEditableStateDigest } from "../../lib/clipstitchr/publishing/media/createSwipePublishingEditableStateDigest";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  query: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ query: mocks.query }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(recordsByTable: Record<string, unknown>) {
  const indexCalls: Array<{ field: string; value: string }> = [];
  const ctx = {
    db: {
      query: vi.fn((table: string) => {
        const index = {
          eq: vi.fn((field: string, value: string) => {
            indexCalls.push({ field, value });
            return index;
          }),
        };
        const chain = {
          unique: vi.fn(async () => recordsByTable[table] ?? null),
          withIndex: vi.fn(
            (
              _indexName: string,
              applyIndex: (indexQuery: typeof index) => unknown,
            ) => {
              applyIndex(index);
              return chain;
            },
          ),
        };

        return chain;
      }),
    },
  };

  return { ctx, indexCalls };
}

describe("getOwnedPublishingMediaRecord", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("user_123");
  });

  it("returns only the durable Stitch source owned by the authenticated user", async () => {
    const { ctx, indexCalls } = createContext({
      stitches: {
        id: "stitch_123",
        name: "Private working title",
        ownerId: "user_123",
        socialCaption: "Not part of this boundary",
        stitchObject: {
          contentType: "video/mp4",
          key: "users/user_123/stitches/stitch_123/video.mp4",
          size: 8_000_000,
        },
        duration: 12,
        height: 1920,
        width: 1080,
      },
    });

    await expect(
      getHandler<
        { kind: "stitch"; recordId: string },
        Record<string, unknown> | null
      >(get)(ctx, { kind: "stitch", recordId: " stitch_123 " }),
    ).resolves.toEqual({
      durability: "durable",
      kind: "stitch",
      mediaObjects: [
        {
          contentType: "video/mp4",
          durationSeconds: 12,
          height: 1920,
          objectKey: "users/user_123/stitches/stitch_123/video.mp4",
          sizeBytes: 8_000_000,
          width: 1080,
        },
      ],
      ownerId: "user_123",
      recordId: "stitch_123",
    });
    expect(indexCalls).toEqual([
      { field: "ownerId", value: "user_123" },
      { field: "id", value: "stitch_123" },
    ]);
  });

  it("refuses to treat a saved Swipe poster as a carousel", async () => {
    const { ctx } = createContext({
      swipes: {
        id: "swipe_123",
        ownerId: "user_123",
        posterObject: {
          contentType: "image/png",
          key: "users/user_123/swipes/swipe_123/poster.png",
          size: 900_000,
        },
        slides: [{ id: "slide_1", textOverlay: {} }],
      },
    });

    await expect(
      getHandler(get)(ctx, { kind: "swipe", recordId: "swipe_123" }),
    ).resolves.toBeNull();
  });

  it("returns every ordered image from the current saved Swipe bundle", async () => {
    const slides = Array.from({ length: 3 }, (_, index) => ({
      id: `slide_${index + 1}`,
      textOverlay: {
        text: `Slide ${index + 1}`,
        startTime: 0,
        endTime: 3,
        x: 0.5,
        y: 0.5,
        width: 0.8,
        fontSize: 64,
        styleId: "clean" as const,
      },
    }));
    const editableStateDigest = await createSwipePublishingEditableStateDigest({
      backgroundId: "background_1",
      slides,
    });
    const revision = "b".repeat(64);
    const checksumSha256 = `${"A".repeat(43)}=`;
    const checksumKey = "A".repeat(43);
    const { ctx } = createContext({
      swipes: {
        backgroundId: "background_1",
        id: "swipe_123",
        ownerId: "user_123",
        publishingRevision: revision,
        publishingBundle: {
          backgrounds: [
            {
              contentType: "image/jpeg",
              id: "background_1",
              objectKey:
                "users/user_123/swipr-backgrounds/background_1/image.jpg",
              sizeBytes: 100,
              version: 'etag:"background"',
            },
          ],
          createdAt: "2026-08-02T00:00:00.000Z",
          editableStateDigest,
          rendererVersion: "swipr-canvas-1080x1920-jpeg-q92-v1",
          revision,
          slides: slides.map((_, index) => ({
            checksumSha256,
            height: 1920,
            index,
            object: {
              contentType: "image/jpeg",
              key: `users/user_123/swipes/swipe_123/publishing/${revision}/slide-${String(index + 1).padStart(2, "0")}-${checksumKey}.jpg`,
              size: 900_000 + index,
            },
            width: 1080,
          })),
        },
        slides,
      },
    });

    await expect(
      getHandler(get)(ctx, { kind: "swipe", recordId: "swipe_123" }),
    ).resolves.toEqual({
      durability: "durable",
      kind: "swipe",
      mediaObjects: slides.map((_, index) => ({
        checksum: `sha256:${checksumSha256}`,
        contentType: "image/jpeg",
        height: 1920,
        objectKey: `users/user_123/swipes/swipe_123/publishing/${revision}/slide-${String(index + 1).padStart(2, "0")}-${checksumKey}.jpg`,
        sizeBytes: 900_000 + index,
        width: 1080,
      })),
      ownerId: "user_123",
      recordId: "swipe_123",
    });
  });

  it("returns the durable video object and inspected library metadata", async () => {
    const { ctx } = createContext({
      videoClips: {
        duration: 9,
        hasAudio: true,
        height: 1920,
        id: "clip_123",
        ownerId: "user_123",
        videoObject: {
          contentType: "video/mp4",
          key: "users/user_123/video-clips/clip_123/video.mp4",
          size: 4_000_000,
        },
        width: 1080,
      },
    });

    await expect(
      getHandler(get)(ctx, {
        kind: "library-media",
        recordId: "clip_123",
      }),
    ).resolves.toEqual({
      durability: "durable",
      kind: "library-media",
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
    });
  });

  it("returns null for another user's record through the owner-scoped index", async () => {
    const { ctx, indexCalls } = createContext({});

    await expect(
      getHandler(get)(ctx, { kind: "stitch", recordId: "stitch_other" }),
    ).resolves.toBeNull();
    expect(indexCalls).toContainEqual({ field: "ownerId", value: "user_123" });
    expect(indexCalls).not.toContainEqual({
      field: "ownerId",
      value: "user_456",
    });
  });

  it("does not let an extra browser owner field replace authenticated ownership", async () => {
    const { ctx, indexCalls } = createContext({
      stitches: {
        duration: 12,
        height: 1920,
        id: "stitch_123",
        stitchObject: {
          contentType: "video/mp4",
          key: "users/user_123/stitches/stitch_123/video.mp4",
          size: 8_000_000,
        },
        width: 1080,
      },
    });

    const result = await getHandler<
      {
        kind: "stitch";
        ownerId: string;
        recordId: string;
        tenantId: string;
      },
      { ownerId: string } | null
    >(get)(ctx, {
      kind: "stitch",
      ownerId: "user_456",
      recordId: "stitch_123",
      tenantId: "clerk:organization:org_other",
    });

    expect(result?.ownerId).toBe("user_123");
    expect(indexCalls).toContainEqual({ field: "ownerId", value: "user_123" });
    expect(indexCalls).not.toContainEqual({
      field: "ownerId",
      value: "user_456",
    });
  });

  it("fails before reading the database when authentication is missing", async () => {
    mocks.getAuthenticatedOwnerId.mockRejectedValue(new Error("Not authenticated"));
    const { ctx } = createContext({});

    await expect(
      getHandler(get)(ctx, { kind: "stitch", recordId: "stitch_123" }),
    ).rejects.toThrow("Not authenticated");
    expect(ctx.db.query).not.toHaveBeenCalled();
  });

  it("rejects URL-shaped and unbounded record IDs before querying", async () => {
    const { ctx } = createContext({});

    await expect(
      getHandler(get)(ctx, {
        kind: "stitch",
        recordId: "blob:https://clipstitchr.com/local",
      }),
    ).resolves.toBeNull();
    expect(ctx.db.query).not.toHaveBeenCalled();
  });
});
