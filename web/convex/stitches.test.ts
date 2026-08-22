import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyQuickEdit,
  addSocialPublishingPost,
  get,
  list,
  remove,
  resetQuickEdit,
  save,
  saveFromMediaWorker,
  updateMusic,
  updatePostedStatus,
  updatePoster,
  updateRenderedVideo,
  updateScore,
  updateSourceSettings,
  updateTextOverlay,
} from "./stitches";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  commitUserStitchUsage: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  assertMediaWorkerSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
  query: vi.fn((definition) => definition),
  stitchCounts: {
    deleteIfExists: vi.fn(),
    insertIfDoesNotExist: vi.fn(),
    replaceOrInsert: vi.fn(),
  },
  stitchProductCounts: {
    deleteIfExists: vi.fn(),
    insertIfDoesNotExist: vi.fn(),
    replaceOrInsert: vi.fn(),
  },
  rateLimiter: {
    limit: vi.fn(),
  },
}));

vi.mock("./_generated/server", () => ({
  internalMutation: mocks.mutation,
  mutation: mocks.mutation,
  query: mocks.query,
}));

vi.mock("./auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));

vi.mock("./auth/assertMediaWorkerSecret", () => ({
  assertMediaWorkerSecret: mocks.assertMediaWorkerSecret,
}));

vi.mock("./rateLimiter", () => ({
  rateLimiter: mocks.rateLimiter,
}));

vi.mock("./aggregateCounts", () => ({
  stitchCounts: mocks.stitchCounts,
  stitchProductCounts: mocks.stitchProductCounts,
}));

vi.mock("./usage/commitUserStitchUsage", () => ({
  commitUserStitchUsage: mocks.commitUserStitchUsage,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(
  uniqueValues: unknown[] = [],
  collect: unknown[] = [],
) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    collect: vi.fn(async () => collect),
    order: vi.fn(() => chain),
    paginate: vi.fn(async () => collect),
    unique: vi.fn(async () => uniqueValues.shift() ?? null),
    withIndex: vi.fn(
      (_indexName: string, callback: (q: typeof indexQuery) => void) => {
        callback(indexQuery);

        return chain;
      },
    ),
  };

  return chain;
}

function createCtx(uniqueValues: unknown[] = [], collect: unknown[] = []) {
  const chain = createQueryChain(uniqueValues, collect);

  return {
    chain,
    ctx: {
      db: {
        delete: vi.fn(),
        get: vi.fn(async (_id: string) => ({ _id, id: "stitch_1" })),
        insert: vi.fn(async () => "doc_inserted"),
        patch: vi.fn(),
        query: vi.fn(() => chain),
      },
    },
  };
}

function createSaveArgs(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    demoClipId: "demo_1",
    demoClipName: "Demo",
    duration: 12,
    height: 1920,
    id: "stitch_1",
    name: "Stitch",
    ugcClipId: "ugc_1",
    ugcClipName: "UGC",
    width: 1080,
    ...overrides,
  };
}

function createSaveSourceClipFixtures() {
  return [
    { id: "ugc_1", clipType: "ugc", name: "UGC" },
    { id: "demo_1", clipType: "demo", name: "Demo", productId: "product_1" },
    { id: "demo_1", clipType: "demo", name: "Demo", productId: "product_1" },
  ];
}

function createSocialPublishingPost(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: "2026-06-27T10:00:00.000Z",
    hasAudio: true,
    mediaIds: ["media_1"],
    mediaKind: "video",
    platforms: ["tiktok"],
    postId: "post_1",
    socialAccountIds: [123],
    sourceType: "stitch",
    status: "scheduled",
    updatedAt: "2026-06-27T10:00:00.000Z",
    ...overrides,
  };
}

describe("convex stitches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
    mocks.commitUserStitchUsage.mockResolvedValue("reservation_123");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lists, gets, inserts, and patches stitches", async () => {
    const stitches = [{ _id: "doc_1", id: "stitch_1" }];
    let setup = createCtx([{ _id: "doc_1", id: "stitch_1" }], stitches);

    await expect(
      getHandler(list)(setup.ctx, {
        paginationOpts: { cursor: null, numItems: 20 },
        sortOrder: "oldest",
      }),
    ).resolves.toBe(stitches);
    await expect(
      getHandler(get)(setup.ctx, { id: "stitch_1" }),
    ).resolves.toEqual({ _id: "doc_1", id: "stitch_1" });
    expect(setup.chain.order).toHaveBeenCalledWith("asc");
    expect(setup.chain.paginate).toHaveBeenCalledWith({
      cursor: null,
      maximumBytesRead: 524288,
      maximumRowsRead: 120,
      numItems: 20,
    });

    setup = createCtx([], stitches);
    await expect(
      getHandler(list)(setup.ctx, {
        paginationOpts: { cursor: null, numItems: 20 },
        postedStatus: "posted",
      }),
    ).resolves.toBe(stitches);
    expect(setup.chain.withIndex).toHaveBeenCalledWith(
      "by_owner_is_posted_created",
      expect.any(Function),
    );

    setup = createCtx([null, ...createSaveSourceClipFixtures()]);
    await expect(getHandler(save)(setup.ctx, createSaveArgs())).resolves.toBe(
      "doc_inserted",
    );
    expect(setup.ctx.db.insert).toHaveBeenCalledWith(
      "stitches",
      expect.objectContaining({
        ownerId: "owner_123",
      }),
    );

    setup = createCtx([
      { _id: "doc_existing", id: "stitch_1" },
      ...createSaveSourceClipFixtures(),
    ]);
    await expect(getHandler(save)(setup.ctx, createSaveArgs())).resolves.toBe(
      "doc_existing",
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_existing",
      expect.objectContaining({
        ownerId: "owner_123",
      }),
    );
  });

  it("does not let client time control Stitchr reservation completion", async () => {
    const serverNow = "2026-07-16T12:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(serverNow);
    const setup = createCtx([null, ...createSaveSourceClipFixtures()]);

    await getHandler(save)(
      setup.ctx,
      createSaveArgs({
        createdAt: "2000-01-01T00:00:00.000Z",
        usageReservationId: "reservation_123",
      }),
    );

    expect(mocks.commitUserStitchUsage).toHaveBeenCalledWith(setup.ctx, {
      now: serverNow,
      ownerId: "owner_123",
      stitchId: "stitch_1",
      usageIdempotencyKey: undefined,
      usageReservationId: "reservation_123",
    });
  });

  it("rejects a save when a referenced source clip is not owned by the user", async () => {
    const setup = createCtx([
      null,
      { id: "ugc_1", clipType: "ugc", name: "UGC" },
      null,
    ]);

    await expect(
      getHandler(save)(setup.ctx, createSaveArgs()),
    ).rejects.toThrow("Stitchr source clips were not found.");
    expect(setup.ctx.db.insert).not.toHaveBeenCalled();
  });

  it("rejects a standalone Normal save with mismatched legacy representatives", async () => {
    const setup = createCtx([
      null,
      { id: "ugc_1", clipType: "ugc", name: "UGC", productId: "product_1" },
    ]);

    await expect(
      getHandler(save)(
        setup.ctx,
        createSaveArgs({
          demoClipId: "demo_1",
          mode: "normal",
          sequenceSegments: [
            {
              clipId: "ugc_1",
              clipName: "UGC",
              clipType: "ugc",
              duration: 12,
              order: 0,
              trimRange: { start: 0, end: 12 },
            },
          ],
        }),
      ),
    ).rejects.toThrow(
      "Normal Stitchr standalone source fields must match the sequence segment.",
    );
    expect(setup.ctx.db.insert).not.toHaveBeenCalled();
  });

  it("keys Stitchr Batch media-worker saves by the batch date", async () => {
    const setup = createCtx([
      { id: "ugc_1", clipType: "ugc", name: "UGC" },
      { id: "demo_1", clipType: "demo", name: "Demo", productId: "product_1" },
      null,
    ]);

    await getHandler(saveFromMediaWorker)(setup.ctx, {
      ...createSaveArgs(),
      automation: {
        automationDate: "2026-06-22",
        runId: "stitchr-batch:owner_123:2026-06-22",
        source: "automation",
        taskId: "stitchr-batch:owner_123:2026-06-22:1",
        tool: "stitchr",
      },
      ownerId: "owner_123",
      secret: "media-secret",
    });

    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      expect.anything(),
      "stitchrBatchAssetSaveDaily",
      expect.objectContaining({
        key: "owner_123:2026-06-22",
        throws: true,
      }),
    );
  });

  it("updates poster, rendered video, source settings, music, score, text, and posted status", async () => {
    const setup = createCtx([
      { _id: "doc_1", id: "stitch_1" },
      null,
      { _id: "doc_1", id: "stitch_1" },
      null,
      { _id: "doc_1", id: "stitch_1" },
      null,
      { _id: "doc_1", id: "stitch_1" },
      { id: "ugc_2", clipType: "ugc", name: "UGC 2" },
      { id: "demo_2", clipType: "demo", name: "Demo 2" },
      null,
      { _id: "doc_1", id: "stitch_1" },
      null,
      { _id: "doc_1", id: "stitch_1" },
      null,
      { _id: "doc_1", id: "stitch_1" },
      null,
    ]);

    await getHandler(updatePoster)(setup.ctx, {
      id: "stitch_1",
      posterObject: { contentType: "image/jpeg", key: "poster.jpg", size: 10 },
      posterVersion: 2,
    });
    await getHandler(updateRenderedVideo)(setup.ctx, {
      id: "stitch_1",
      mimeType: "video/mp4",
      size: 100,
      stitchObject: { contentType: "video/mp4", key: "stitch.mp4", size: 100 },
    });
    await getHandler(updateMusic)(setup.ctx, {
      id: "stitch_1",
      music: null,
    });
    await getHandler(updateSourceSettings)(setup.ctx, {
      id: "stitch_1",
      demoClipId: "demo_2",
      demoClipName: "Demo 2",
      demoPlaybackRate: 2,
      demoTrimRange: {
        end: 8,
        start: 2,
      },
      duration: 9,
      name: "updated-stitch.mp4",
      posterObject: null,
      ugcClipId: "ugc_2",
      ugcClipName: "UGC 2",
      ugcPlaybackRate: 1,
      ugcTrimRange: {
        end: 3,
        start: 0,
      },
    });
    await getHandler(updateTextOverlay)(setup.ctx, {
      id: "stitch_1",
      textOverlay: null,
    });
    await getHandler(updateScore)(setup.ctx, {
      id: "stitch_1",
      stitchScore: {
        dropOffRiskPoints: ["Demo starts late"],
        hookToDemoFlow: 81,
        overallRetentionEstimate: 78,
        suggestedOpeningLine: "Wait for the demo",
        suggestedOverlayText: ["Wait for the demo"],
        suggestedTrims: ["Cut the first pause"],
        summary: "The hook is clear but the handoff can move faster.",
      },
    });
    await getHandler(updatePostedStatus)(setup.ctx, {
      id: "stitch_1",
      isPosted: true,
    });

    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({ posterVersion: 2 }),
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({ mimeType: "video/mp4" }),
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({
        music: undefined,
        stitchObject: undefined,
      }),
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({
        demoClipId: "demo_2",
        demoPlaybackRate: 2,
        mimeType: undefined,
        posterObject: undefined,
        size: undefined,
        stitchObject: undefined,
        ugcClipId: "ugc_2",
        ugcPlaybackRate: 1,
      }),
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({
        stitchObject: undefined,
        textOverlay: undefined,
      }),
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({
        firstStitchScore: expect.objectContaining({
          overallRetentionEstimate: 78,
        }),
        stitchScore: expect.objectContaining({
          overallRetentionEstimate: 78,
        }),
      }),
    );
    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({
        isPosted: true,
        postedAt: expect.any(String),
      }),
    );
  });

  it("marks stitches posted when adding a Zernio post reference", async () => {
    const setup = createCtx([
      {
        _id: "doc_1",
        id: "stitch_1",
        socialPublishingPosts: [
          createSocialPublishingPost({
            mediaIds: ["old_media"],
            postId: "post_1",
          }),
        ],
      },
    ]);

    await getHandler(addSocialPublishingPost)(setup.ctx, {
      id: "stitch_1",
      post: createSocialPublishingPost({
        mediaIds: ["new_media"],
        postId: "post_1",
      }),
    });

    expect(setup.ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({
        isPosted: true,
        socialPublishingPosts: [
          expect.objectContaining({
            mediaIds: ["new_media"],
            postId: "post_1",
          }),
        ],
        postedAt: expect.any(String),
      }),
    );
    expect(mocks.stitchCounts.replaceOrInsert).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ id: "stitch_1" }),
      expect.objectContaining({ id: "stitch_1" }),
    );
    expect(mocks.stitchProductCounts.replaceOrInsert).toHaveBeenCalled();
  });

  it("throws for missing updates and returns removed stitches", async () => {
    let setup = createCtx([null]);

    await expect(
      getHandler(updatePoster)(setup.ctx, {
        id: "missing",
        posterObject: {
          contentType: "image/jpeg",
          key: "poster.jpg",
          size: 10,
        },
        posterVersion: 2,
      }),
    ).rejects.toThrow("Stitch not found.");

    setup = createCtx([{ _id: "doc_1", id: "stitch_1" }, null]);
    await expect(
      getHandler(remove)(setup.ctx, { id: "stitch_1" }),
    ).resolves.toEqual({ _id: "doc_1", id: "stitch_1" });
    await expect(
      getHandler(remove)(setup.ctx, { id: "missing" }),
    ).resolves.toBeNull();
    expect(setup.ctx.db.delete).toHaveBeenCalledWith("doc_1");
  });

  it("archives the existing first Stitch score when rescoring legacy records", async () => {
    const firstScore = {
      dropOffRiskPoints: ["Slow middle"],
      hookToDemoFlow: 70,
      overallRetentionEstimate: 68,
      suggestedOpeningLine: "Start closer to the result",
      suggestedOverlayText: [],
      suggestedTrims: ["Cut 3-5s"],
      summary: "Needs a tighter middle.",
    };
    const nextScore = {
      dropOffRiskPoints: ["Demo still lands a little late"],
      hookToDemoFlow: 82,
      overallRetentionEstimate: 84,
      reassessment: {
        completedImprovements: ["The 3-5s cut is gone"],
        remainingImprovements: ["Demo can still arrive sooner"],
        postingReadiness: "Much closer and ready after one last trim.",
      },
      suggestedOpeningLine: "Open on the result",
      suggestedOverlayText: [],
      suggestedTrims: ["Trim the demo handoff"],
      summary: "The cut improved retention.",
    };
    const setup = createCtx([
      {
        _id: "doc_1",
        id: "stitch_1",
        stitchScore: firstScore,
      },
    ]);

    await getHandler(updateScore)(setup.ctx, {
      id: "stitch_1",
      stitchScore: nextScore,
    });

    expect(setup.ctx.db.patch).toHaveBeenCalledWith("doc_1", {
      firstStitchScore: firstScore,
      stitchScore: nextScore,
    });
  });

  it("preserves Stitch score when applying and resetting Quick Edit", async () => {
    const setup = createCtx([
      {
        _id: "doc_1",
        demoTrimRange: { start: 0, end: 8 },
        duration: 12,
        id: "stitch_1",
        stitchScore: {
          dropOffRiskPoints: ["Slow handoff"],
          hookToDemoFlow: 81,
          overallRetentionEstimate: 78,
          suggestedOverlayText: ["Better hook"],
          suggestedTrims: ["Cut the first pause"],
          summary: "Good but can be tighter.",
        },
        ugcTrimRange: { start: 0, end: 4 },
      },
      null,
      {
        _id: "doc_1",
        duration: 10,
        id: "stitch_1",
        quickEdit: {
          appliedAt: "2026-05-20T00:00:00.000Z",
          baseline: {
            demoTrimRange: { start: 0, end: 8 },
            duration: 12,
            ugcTrimRange: { start: 0, end: 4 },
          },
          removeRanges: [],
          source: "ai-score",
        },
        stitchScore: {
          dropOffRiskPoints: ["Slow handoff"],
          hookToDemoFlow: 81,
          overallRetentionEstimate: 78,
          suggestedOverlayText: ["Better hook"],
          suggestedTrims: ["Cut the first pause"],
          summary: "Good but can be tighter.",
        },
      },
      null,
    ]);

    await getHandler(applyQuickEdit)(setup.ctx, {
      id: "stitch_1",
      demoTrimRange: { start: 0, end: 6 },
      duration: 10,
      posterObject: {
        contentType: "image/jpeg",
        key: "poster-quick-edit.jpg",
        size: 10,
      },
      posterVersion: 2,
      quickEdit: {
        removeRanges: [{ start: 4, end: 6, reason: "Slow section" }],
        summary: "Tighter edit.",
      },
      textOverlay: null,
      ugcTrimRange: { start: 0, end: 4 },
    });
    await getHandler(resetQuickEdit)(setup.ctx, {
      id: "stitch_1",
      posterObject: null,
    });

    expect(setup.ctx.db.patch).toHaveBeenNthCalledWith(
      1,
      "doc_1",
      expect.not.objectContaining({
        stitchScore: undefined,
      }),
    );
    expect(setup.ctx.db.patch).toHaveBeenNthCalledWith(
      1,
      "doc_1",
      expect.objectContaining({
        posterObject: {
          contentType: "image/jpeg",
          key: "poster-quick-edit.jpg",
          size: 10,
        },
        posterVersion: 2,
      }),
    );
    expect(setup.ctx.db.patch).toHaveBeenNthCalledWith(
      2,
      "doc_1",
      expect.not.objectContaining({
        stitchScore: undefined,
      }),
    );
    expect(setup.ctx.db.patch).toHaveBeenNthCalledWith(
      2,
      "doc_1",
      expect.objectContaining({
        posterObject: undefined,
        posterVersion: undefined,
      }),
    );
  });
});
