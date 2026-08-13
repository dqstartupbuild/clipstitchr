import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "./getOwnedPublishingMediaRecord";
import { createSwipePublishingEditableStateDigest } from "../../lib/clipstitchr/publishing/media/createSwipePublishingEditableStateDigest";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertAccess: vi.fn(),
  assertProduct: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  limit: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: { limit: mocks.limit } }));
vi.mock("../studioBetaAccess/assertStudioBetaAccess", () => ({
  assertStudioBetaAccess: mocks.assertAccess,
}));
vi.mock("../studioPublishingScope/assertStudioPublishingActiveProduct", () => ({
  assertStudioPublishingActiveProduct: mocks.assertProduct,
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
        productId: "product_1",
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
        { kind: "stitch"; productId: string; recordId: string },
        Record<string, unknown> | null
      >(get)(ctx, {
        kind: "stitch",
        productId: "product_1",
        recordId: " stitch_123 ",
      }),
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
      getHandler(get)(ctx, {
        kind: "swipe",
        productId: "product_1",
        recordId: "swipe_123",
      }),
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
        productSourceId: "product_1",
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
      getHandler(get)(ctx, {
        kind: "swipe",
        productId: "product_1",
        recordId: "swipe_123",
      }),
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
        productId: "product_1",
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
        productId: "product_1",
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

  it("returns a Product-owned Library photo for a YouTube thumbnail", async () => {
    const { ctx } = createContext({
      photoAssets: {
        height: 720,
        id: "photo_123",
        ownerId: "user_123",
        photoObject: {
          contentType: "image/jpeg",
          key: "users/user_123/photos/photo_123/photo.jpg",
          size: 1_500_000,
        },
        productId: "product_1",
        width: 1280,
      },
    });

    await expect(
      getHandler(get)(ctx, {
        kind: "library-media",
        productId: "product_1",
        recordId: "photo_123",
      }),
    ).resolves.toEqual({
      durability: "durable",
      kind: "library-media",
      mediaObjects: [
        {
          contentType: "image/jpeg",
          height: 720,
          objectKey: "users/user_123/photos/photo_123/photo.jpg",
          sizeBytes: 1_500_000,
          width: 1280,
        },
      ],
      ownerId: "user_123",
      recordId: "photo_123",
    });
  });

  it("returns a completed Studio Clips output from the same Product", async () => {
    const { ctx, indexCalls } = createContext({
      studioClipsOutputs: {
        audioCodec: "aac",
        contentType: "video/mp4",
        durationSeconds: 24,
        hasAudio: true,
        height: 1920,
        id: "clip_output_123",
        objectKey:
          "users/user_123/studio/v1/studio-clips/task_123/clip_output_123.mp4",
        ownerId: "user_123",
        productId: "product_1",
        sizeBytes: 7_000_000,
        taskId: "task_123",
        videoCodec: "h264",
        width: 1080,
      },
      studioClipsTasks: {
        id: "task_123",
        ownerId: "user_123",
        productId: "product_1",
        status: "completed",
      },
    });

    await expect(
      getHandler(get)(ctx, {
        kind: "studio-clip-output",
        productId: "product_1",
        recordId: "clip_output_123",
      }),
    ).resolves.toEqual({
      durability: "durable",
      kind: "studio-clip-output",
      mediaObjects: [
        {
          audioCodec: "aac",
          contentType: "video/mp4",
          durationSeconds: 24,
          hasAudio: true,
          height: 1920,
          objectKey:
            "users/user_123/studio/v1/studio-clips/task_123/clip_output_123.mp4",
          sizeBytes: 7_000_000,
          videoCodec: "h264",
          width: 1080,
        },
      ],
      ownerId: "user_123",
      recordId: "clip_output_123",
    });
    expect(indexCalls).toContainEqual({
      field: "productId",
      value: "product_1",
    });
  });

  it("keeps unfinished Studio Clips outputs outside publishing", async () => {
    const { ctx } = createContext({
      studioClipsOutputs: {
        contentType: "video/mp4",
        id: "clip_output_123",
        objectKey:
          "users/user_123/studio/v1/studio-clips/task_123/clip_output_123.mp4",
        ownerId: "user_123",
        productId: "product_1",
        sizeBytes: 7_000_000,
        taskId: "task_123",
      },
      studioClipsTasks: {
        id: "task_123",
        ownerId: "user_123",
        productId: "product_1",
        status: "processing",
      },
    });

    await expect(
      getHandler(get)(ctx, {
        kind: "studio-clip-output",
        productId: "product_1",
        recordId: "clip_output_123",
      }),
    ).resolves.toBeNull();
  });

  it("returns only accepted Studio Stitch outputs from the same Product", async () => {
    const { ctx, indexCalls } = createContext({
      studioReelOutputs: {
        byteLength: 9_000_000,
        contentType: "video/mp4",
        durationSeconds: 15,
        id: "stitch_output_123",
        objectKey:
          "users/user_123/studio/v1/media-output/product_1/stitch_output_123.mp4",
        ownerId: "user_123",
        productId: "product_1",
        status: "accepted",
      },
    });

    await expect(
      getHandler(get)(ctx, {
        kind: "studio-stitch-output",
        productId: "product_1",
        recordId: "stitch_output_123",
      }),
    ).resolves.toEqual({
      durability: "durable",
      kind: "studio-stitch-output",
      mediaObjects: [
        {
          contentType: "video/mp4",
          durationSeconds: 15,
          objectKey:
            "users/user_123/studio/v1/media-output/product_1/stitch_output_123.mp4",
          sizeBytes: 9_000_000,
        },
      ],
      ownerId: "user_123",
      recordId: "stitch_output_123",
    });
    expect(indexCalls).toContainEqual({
      field: "productId",
      value: "product_1",
    });
  });

  it("checks Studio access, Product ownership, and both read gates before media lookup", async () => {
    const { ctx } = createContext({});

    await getHandler(get)(ctx, {
      kind: "stitch",
      productId: "product_1",
      recordId: "stitch_123",
    });

    expect(mocks.assertAccess).toHaveBeenCalledWith(ctx, "user_123");
    expect(mocks.assertProduct).toHaveBeenCalledWith(
      ctx,
      "user_123",
      "product_1",
    );
    expect(mocks.limit.mock.calls).toEqual([
      [ctx, "studioPublishingStaticRead", { key: "user_123", throws: true }],
      [ctx, "studioPublishingStaticReadGlobal", { throws: true }],
    ]);
    expect(mocks.limit.mock.invocationCallOrder[1]).toBeLessThan(
      ctx.db.query.mock.invocationCallOrder[0],
    );
  });

  it("returns null for another user's record through the owner-scoped index", async () => {
    const { ctx, indexCalls } = createContext({});

    await expect(
      getHandler(get)(ctx, {
        kind: "stitch",
        productId: "product_1",
        recordId: "stitch_other",
      }),
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
        productId: "product_1",
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
        productId: string;
        recordId: string;
        tenantId: string;
      },
      { ownerId: string } | null
    >(get)(ctx, {
      kind: "stitch",
      ownerId: "user_456",
      productId: "product_1",
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
      getHandler(get)(ctx, {
        kind: "stitch",
        productId: "product_1",
        recordId: "stitch_123",
      }),
    ).rejects.toThrow("Not authenticated");
    expect(ctx.db.query).not.toHaveBeenCalled();
  });

  it("rejects URL-shaped and unbounded record IDs before querying", async () => {
    const { ctx } = createContext({});

    await expect(
      getHandler(get)(ctx, {
        kind: "stitch",
        productId: "product_1",
        recordId: "blob:https://clipstitchr.com/local",
      }),
    ).resolves.toBeNull();
    expect(ctx.db.query).not.toHaveBeenCalled();
  });
});
