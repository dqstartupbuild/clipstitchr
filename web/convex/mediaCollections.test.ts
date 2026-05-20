import { beforeEach, describe, expect, it, vi } from "vitest";
import * as avatars from "./avatars";
import * as longrVideos from "./longrVideos";
import * as photoAssets from "./photoAssets";
import * as replicateJobs from "./replicateJobs";
import * as stitches from "./stitches";
import * as swipes from "./swipes";
import * as videoClips from "./videoClips";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

type QueryResult = {
  collect?: unknown[];
  take?: unknown[];
  unique?: unknown;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  query: vi.fn((definition) => definition),
  rateLimiter: {
    limit: vi.fn(),
  },
}));

vi.mock("./_generated/server", () => ({
  mutation: mocks.mutation,
  query: mocks.query,
}));

vi.mock("./auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));

vi.mock("./auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));

vi.mock("./rateLimiter", () => ({
  rateLimiter: mocks.rateLimiter,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(result: QueryResult = {}) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    collect: vi.fn(async () => result.collect ?? []),
    order: vi.fn(() => chain),
    take: vi.fn(async () => result.take ?? []),
    unique: vi.fn(async () => result.unique ?? null),
    withIndex: vi.fn((_index: string, callback: (q: typeof indexQuery) => void) => {
      callback(indexQuery);

      return chain;
    }),
  };

  return chain;
}

function createCtx(resultsByTable: Record<string, QueryResult[]> = {}) {
  const queues = new Map(
    Object.entries(resultsByTable).map(([table, results]) => [
      table,
      [...results],
    ]),
  );
  const ctx = {
    db: {
      delete: vi.fn(async () => undefined),
      insert: vi.fn(async () => "inserted_doc"),
      patch: vi.fn(async () => undefined),
      query: vi.fn((table: string) => {
        const queue = queues.get(table);
        const result = queue?.shift() ?? {};

        return createQueryChain(result);
      }),
    },
  };

  return ctx;
}

const r2Video = {
  contentType: "video/mp4",
  key: "users/user_123/video.mp4",
  size: 100,
};
const r2Image = {
  contentType: "image/jpeg",
  key: "users/user_123/poster.jpg",
  size: 10,
};
const now = "2026-05-20T00:00:00.000Z";

function createVideoClipArgs(overrides: Record<string, unknown> = {}) {
  return {
    aspectRatio: 9 / 16,
    clipType: "ugc",
    createdAt: now,
    duration: 12,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    mimeType: "video/mp4",
    name: "Clip",
    originalName: "clip.mp4",
    originalSize: 100,
    posterObject: r2Image,
    size: 100,
    sourceMimeType: "video/mp4",
    tags: ["ugc"],
    updatedAt: now,
    videoObject: r2Video,
    width: 1080,
    ...overrides,
  };
}

function createStitchArgs(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: now,
    demoClipId: "demo_1",
    demoClipName: "Demo",
    duration: 18,
    height: 1920,
    id: "stitch_1",
    name: "Stitch",
    stitchObject: r2Video,
    ugcClipId: "ugc_1",
    ugcClipName: "UGC",
    width: 1080,
    ...overrides,
  };
}

function createPhotoArgs(overrides: Record<string, unknown> = {}) {
  return {
    avatarId: "avatar_1",
    createdAt: now,
    height: 1920,
    id: "photo_1",
    mimeType: "image/jpeg",
    name: "Photo",
    originalName: "photo.png",
    photoObject: r2Image,
    size: 10,
    tags: ["photo"],
    updatedAt: now,
    width: 1080,
    ...overrides,
  };
}

function createLongrArgs(overrides: Record<string, unknown> = {}) {
  return {
    clipSegments: [],
    createdAt: now,
    duration: 120,
    height: 1920,
    id: "longr_1",
    longrObject: r2Video,
    mimeType: "video/mp4",
    name: "Longr",
    size: 100,
    width: 1080,
    ...overrides,
  };
}

function createSwipeArgs(overrides: Record<string, unknown> = {}) {
  return {
    backgroundId: "background_1",
    createdAt: now,
    id: "swipe_1",
    name: "  Swipe  ",
    productContext: "  Context  ",
    productName: "  Product  ",
    productSourceId: "product_1",
    productSourceType: "saved-product",
    slides: [],
    updatedAt: now,
    ...overrides,
  };
}

function createAvatarArgs(overrides: Record<string, unknown> = {}) {
  return {
    cliprVoiceId: "Zephyr (Female)",
    createdAt: now,
    description: "Creator",
    id: "avatar_1",
    name: "Avatar",
    updatedAt: now,
    wardrobeStyle: "any",
    ...overrides,
  };
}

describe("convex media collections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("creates demo clips only for owned products and updates Clipr music", async () => {
    const saveCtx = createCtx({
      products: [{ unique: { _id: "product_doc", id: "product_1" } }],
      videoClips: [{ unique: null }],
    });

    await expect(
      getHandler<Record<string, unknown>, unknown>(videoClips.save)(
        saveCtx,
        createVideoClipArgs({
          clipType: "demo",
          productId: " product_1 ",
        }),
      ),
    ).resolves.toBe("inserted_doc");
    expect(saveCtx.db.insert).toHaveBeenCalledWith(
      "videoClips",
      expect.objectContaining({
        ownerId: "owner_123",
        productId: "product_1",
      }),
    );

    const missingProductCtx = createCtx({ products: [{ unique: null }] });

    await expect(
      getHandler<Record<string, unknown>, unknown>(videoClips.save)(
        missingProductCtx,
        createVideoClipArgs({ clipType: "demo", productId: "product_1" }),
      ),
    ).rejects.toThrow("Product not found.");

    const musicCtx = createCtx({
      videoClips: [
        {
          unique: {
            _id: "clip_doc",
            cliprMetadata: {
              providerModels: ["existing-model"],
            },
          },
        },
      ],
    });

    await getHandler<Record<string, unknown>, void>(videoClips.updateCliprMusic)(
      musicCtx,
      {
        id: "clip_1",
        music: {
          audioObject: r2Video,
          createdAt: now,
          durationSeconds: 15,
          enabled: true,
          prompt: "Beat",
          providerModel: "new-model",
          providerPredictionId: "prediction_1",
          updatedAt: now,
          volume: 0.5,
        },
        updatedAt: now,
      },
    );
    expect(musicCtx.db.patch).toHaveBeenCalledWith(
      "clip_doc",
      expect.objectContaining({
        cliprMetadata: expect.objectContaining({
          providerModels: ["existing-model", "new-model"],
        }),
      }),
    );
  });

  it("patches and removes stitches with metadata rate limits", async () => {
    const saveCtx = createCtx({
      stitches: [{ unique: { _id: "stitch_doc" } }],
    });

    await expect(
      getHandler<Record<string, unknown>, unknown>(stitches.save)(
        saveCtx,
        createStitchArgs(),
      ),
    ).resolves.toBe("stitch_doc");
    expect(saveCtx.db.patch).toHaveBeenCalledWith(
      "stitch_doc",
      expect.objectContaining({ ownerId: "owner_123" }),
    );

    const updateCtx = createCtx({
      stitches: [
        { unique: { _id: "stitch_doc" } },
        { unique: { _id: "stitch_doc" } },
      ],
    });

    await getHandler<Record<string, unknown>, void>(stitches.updateRenderedVideo)(
      updateCtx,
      {
        id: "stitch_1",
        mimeType: "video/mp4",
        size: 100,
        stitchObject: r2Video,
      },
    );
    await getHandler<Record<string, unknown>, void>(stitches.updateTextOverlay)(
      updateCtx,
      {
        id: "stitch_1",
        textOverlay: null,
      },
    );
    expect(updateCtx.db.patch).toHaveBeenCalledWith(
      "stitch_doc",
      expect.objectContaining({ stitchObject: r2Video }),
    );
    expect(updateCtx.db.patch).toHaveBeenCalledWith("stitch_doc", {
      textOverlay: undefined,
    });

    const removeCtx = createCtx({
      stitches: [{ unique: { _id: "stitch_doc", id: "stitch_1" } }],
    });

    await expect(
      getHandler<Record<string, unknown>, unknown>(stitches.remove)(removeCtx, {
        id: "stitch_1",
      }),
    ).resolves.toEqual({ _id: "stitch_doc", id: "stitch_1" });
    expect(removeCtx.db.delete).toHaveBeenCalledWith("stitch_doc");
  });

  it("finds, updates, and removes photo assets", async () => {
    const firstPhoto = { _id: "photo_doc_1", avatarId: "avatar_1", id: "a" };
    const secondPhoto = { _id: "photo_doc_2", avatarId: "avatar_2", id: "b" };
    const queryCtx = createCtx({
      photoAssets: [
        { collect: [secondPhoto, firstPhoto] },
        { collect: [firstPhoto, secondPhoto] },
      ],
    });

    await expect(
      getHandler<Record<string, unknown>, unknown>(
        photoAssets.getMostRecentForAvatar,
      )(queryCtx, { avatarId: "avatar_1" }),
    ).resolves.toBe(firstPhoto);
    await expect(
      getHandler<Record<string, unknown>, unknown>(
        photoAssets.getFirstForAvatar,
      )(queryCtx, { avatarId: "avatar_2" }),
    ).resolves.toBe(secondPhoto);

    const saveCtx = createCtx({
      photoAssets: [
        { unique: { _id: "photo_doc_1" } },
        { unique: { _id: "photo_doc_1" } },
      ],
    });

    await expect(
      getHandler<Record<string, unknown>, unknown>(photoAssets.save)(
        saveCtx,
        createPhotoArgs(),
      ),
    ).resolves.toBe("photo_doc_1");
    await getHandler<Record<string, unknown>, void>(photoAssets.updateMetadata)(
      saveCtx,
      {
        id: "photo_1",
        locationDescription: "Studio",
        name: "Updated photo",
        tags: ["photo", "ugc"],
        updatedAt: now,
      },
    );
    expect(saveCtx.db.patch).toHaveBeenCalledWith(
      "photo_doc_1",
      expect.objectContaining({
        locationDescription: "Studio",
        name: "Updated photo",
      }),
    );

    const removeCtx = createCtx({ photoAssets: [{ unique: null }] });

    await expect(
      getHandler<Record<string, unknown>, unknown>(photoAssets.remove)(
        removeCtx,
        { id: "missing" },
      ),
    ).resolves.toBeNull();
  });

  it("updates avatars and deletes them only after the provided photos match", async () => {
    const saveCtx = createCtx({ avatars: [{ unique: null }] });

    await expect(
      getHandler<Record<string, unknown>, unknown>(avatars.save)(
        saveCtx,
        createAvatarArgs(),
      ),
    ).resolves.toBe("inserted_doc");
    expect(saveCtx.db.insert).toHaveBeenCalledWith(
      "avatars",
      expect.objectContaining({ ownerId: "owner_123" }),
    );

    const updateCtx = createCtx({
      avatars: [{ unique: { _id: "avatar_doc" } }],
    });

    await getHandler<Record<string, unknown>, void>(avatars.update)(updateCtx, {
      cliprVoiceId: "Puck (Male)",
      id: "avatar_1",
      name: "Updated Avatar",
      updatedAt: now,
    });
    expect(updateCtx.db.patch).toHaveBeenCalledWith(
      "avatar_doc",
      expect.objectContaining({
        cliprVoiceId: "Puck (Male)",
        name: "Updated Avatar",
      }),
    );

    const deleteCtx = createCtx({
      avatars: [{ unique: { _id: "avatar_doc", id: "avatar_1" } }],
      photoAssets: [
        {
          collect: [
            { _id: "photo_doc_1", avatarId: "avatar_1", id: "photo_1" },
            { _id: "photo_doc_2", avatarId: "other", id: "photo_2" },
          ],
        },
      ],
    });

    await expect(
      getHandler<Record<string, unknown>, unknown>(avatars.removeWithPhotos)(
        deleteCtx,
        {
          id: "avatar_1",
          photoIds: ["photo_1"],
          secret: "secret",
        },
      ),
    ).resolves.toEqual({ deletedAvatar: true, deletedPhotoCount: 1 });
    expect(deleteCtx.db.delete).toHaveBeenCalledWith("photo_doc_1");
    expect(deleteCtx.db.delete).toHaveBeenCalledWith("avatar_doc");

    const changedPhotosCtx = createCtx({
      avatars: [{ unique: { _id: "avatar_doc", id: "avatar_1" } }],
      photoAssets: [
        {
          collect: [
            { _id: "photo_doc_1", avatarId: "avatar_1", id: "photo_1" },
          ],
        },
      ],
    });

    await expect(
      getHandler<Record<string, unknown>, unknown>(avatars.removeWithPhotos)(
        changedPhotosCtx,
        { id: "avatar_1", photoIds: [], secret: "secret" },
      ),
    ).rejects.toThrow("Avatar photos changed while deleting. Try again.");
  });

  it("rejects overlong Longr videos and saves or removes valid records", async () => {
    const tooLongCtx = createCtx();

    await expect(
      getHandler<Record<string, unknown>, unknown>(longrVideos.save)(
        tooLongCtx,
        createLongrArgs({ duration: 301 }),
      ),
    ).rejects.toThrow("Longr videos cannot be longer than 5 minutes.");
    expect(mocks.rateLimiter.limit).not.toHaveBeenCalled();

    const saveCtx = createCtx({
      longrVideos: [{ unique: null }, { unique: { _id: "longr_doc" } }],
    });

    await expect(
      getHandler<Record<string, unknown>, unknown>(longrVideos.save)(
        saveCtx,
        createLongrArgs(),
      ),
    ).resolves.toBe("inserted_doc");
    await expect(
      getHandler<Record<string, unknown>, unknown>(longrVideos.remove)(
        saveCtx,
        { id: "longr_1" },
      ),
    ).resolves.toEqual({ _id: "longr_doc" });
    expect(saveCtx.db.delete).toHaveBeenCalledWith("longr_doc");
  });

  it("normalizes Swipr records after validating background and product", async () => {
    const saveCtx = createCtx({
      products: [{ unique: { _id: "product_doc", id: "product_1" } }],
      swipes: [{ unique: null }],
      swiprBackgrounds: [{ unique: { _id: "background_doc" } }],
    });

    await expect(
      getHandler<Record<string, unknown>, unknown>(swipes.save)(
        saveCtx,
        createSwipeArgs(),
      ),
    ).resolves.toBe("inserted_doc");
    expect(saveCtx.db.insert).toHaveBeenCalledWith(
      "swipes",
      expect.objectContaining({
        name: "Swipe",
        productContext: "Context",
        productName: "Product",
      }),
    );

    const missingBackgroundCtx = createCtx({
      swiprBackgrounds: [{ unique: null }],
    });

    await expect(
      getHandler<Record<string, unknown>, unknown>(swipes.save)(
        missingBackgroundCtx,
        createSwipeArgs(),
      ),
    ).rejects.toThrow("Swipr background not found.");

    const blankNameCtx = createCtx({
      products: [{ unique: { _id: "product_doc" } }],
      swipes: [{ unique: null }],
      swiprBackgrounds: [{ unique: { _id: "background_doc" } }],
    });

    await expect(
      getHandler<Record<string, unknown>, unknown>(swipes.save)(
        blankNameCtx,
        createSwipeArgs({ name: "   " }),
      ),
    ).rejects.toThrow("Swipe name is required.");
  });

  it("records and updates Replicate job rows by purpose", async () => {
    const insertCtx = createCtx({ replicateJobs: [{ unique: null }] });

    await expect(
      getHandler<Record<string, unknown>, unknown>(replicateJobs.recordSwaprJob)(
        insertCtx,
        {
          createdAt: now,
          modelId: "model_1",
          predictionId: "prediction_1",
          secret: "secret",
          status: "starting",
          updatedAt: now,
        },
      ),
    ).resolves.toBe("inserted_doc");
    expect(insertCtx.db.insert).toHaveBeenCalledWith(
      "replicateJobs",
      expect.objectContaining({
        ownerId: "owner_123",
        purpose: "swapr-video",
      }),
    );

    const updateCtx = createCtx({
      replicateJobs: [
        { unique: { _id: "swapr_job", purpose: "swapr-video" } },
        { unique: { _id: "avatar_job", purpose: "avatar-photo" } },
      ],
    });

    await getHandler<Record<string, unknown>, void>(
      replicateJobs.updateSwaprJobStatus,
    )(updateCtx, {
      outputUrl: "https://example.com/video.mp4",
      predictionId: "prediction_1",
      secret: "secret",
      status: "succeeded",
      updatedAt: now,
    });
    await getHandler<Record<string, unknown>, void>(
      replicateJobs.updateAvatarPhotoJobStatus,
    )(updateCtx, {
      error: "failed",
      predictionId: "prediction_2",
      secret: "secret",
      status: "failed",
      updatedAt: now,
    });
    expect(updateCtx.db.patch).toHaveBeenCalledWith(
      "swapr_job",
      expect.objectContaining({ outputUrl: "https://example.com/video.mp4" }),
    );
    expect(updateCtx.db.patch).toHaveBeenCalledWith(
      "avatar_job",
      expect.objectContaining({ error: "failed" }),
    );

    const wrongPurposeCtx = createCtx({
      replicateJobs: [{ unique: { _id: "job", purpose: "avatar-photo" } }],
    });

    await expect(
      getHandler<Record<string, unknown>, unknown>(
        replicateJobs.updateSwaprJobStatus,
      )(wrongPurposeCtx, {
        predictionId: "prediction_1",
        secret: "secret",
        status: "succeeded",
        updatedAt: now,
      }),
    ).rejects.toThrow("Swapr job not found.");
  });
});
