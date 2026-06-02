import { beforeEach, describe, expect, it, vi } from "vitest";
import * as cliprJobs from "./cliprJobs";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

type QueryResult = {
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
    order: vi.fn(() => chain),
    take: vi.fn(async () => result.take ?? []),
    unique: vi.fn(async () => result.unique ?? null),
    withIndex: vi.fn(
      (_indexName: string, callback: (q: typeof indexQuery) => unknown) => {
        callback(indexQuery);

        return chain;
      },
    ),
  };

  return { chain, indexQuery };
}

function createCtx(resultsByTable: Record<string, QueryResult[]> = {}) {
  const queues = new Map(
    Object.entries(resultsByTable).map(([table, results]) => [
      table,
      [...results],
    ]),
  );
  const queryChains: ReturnType<typeof createQueryChain>[] = [];
  const ctx = {
    db: {
      insert: vi.fn(async () => "inserted_doc"),
      patch: vi.fn(async () => undefined),
      query: vi.fn((table: string) => {
        const queue = queues.get(table);
        const result = queue?.shift() ?? {};
        const queryChain = createQueryChain(result);

        queryChains.push(queryChain);

        return queryChain.chain;
      }),
    },
  };

  return { ctx, queryChains };
}

const now = "2026-05-20T00:00:00.000Z";
const videoObject = {
  contentType: "video/mp4",
  key: "users/user_123/clipr/video.mp4",
  size: 100,
};
const imageObject = {
  contentType: "image/jpeg",
  key: "users/user_123/clipr/image.jpg",
  size: 10,
};
const audioObject = {
  contentType: "audio/mpeg",
  key: "users/user_123/clipr/music.mp3",
  size: 20,
};

function createScenePlan(overrides: Record<string, unknown> = {}) {
  return {
    estimatedDurationSeconds: 30,
    id: "scene_1",
    index: 0,
    sceneType: "avatar",
    scriptText: "Try this",
    visualPrompt: "Creator in studio",
    ...overrides,
  };
}

function createJob(overrides: Record<string, unknown> = {}) {
  return {
    _id: "job_doc",
    avatarId: "avatar_1",
    avatarPhotoId: "photo_1",
    createdAt: now,
    filledHook: "Hook",
    hookStyleKey: "problem-solution",
    hookTemplateId: "template_1",
    id: "job_1",
    productId: "product_1",
    productName: "Product",
    progress: 0.25,
    providerModels: ["existing-model"],
    scenePlan: [createScenePlan()],
    script: "Full script",
    stage: "avatar-image",
    status: "generating-avatar-image",
    targetDurationSeconds: 30,
    updatedAt: now,
    variablesUsed: { product: "Product" },
    voiceId: "Zephyr (Female)",
    ...overrides,
  };
}

function createQueuedArgs(overrides: Record<string, unknown> = {}) {
  return {
    audienceDetails: "Creators",
    avatarId: "avatar_1",
    avatarName: "Avatar",
    avatarPhotoId: "photo_1",
    createdAt: now,
    id: "job_1",
    productDetails: "Product details",
    productId: "product_1",
    productInferredPainPoints: ["slow edits"],
    productName: "Product",
    secret: "secret",
    targetDurationSeconds: 30,
    voiceId: "Zephyr (Female)",
    ...overrides,
  };
}

describe("convex cliprJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("lists and gets only the authenticated owner's jobs", async () => {
    const job = createJob({
      avatarImageObject: imageObject,
      avatarVideoObject: videoObject,
      completedAt: now,
      finalClipId: "clip_1",
    });
    const listCtx = createCtx({ cliprJobs: [{ take: [job] }] });

    await expect(
      getHandler<Record<string, never>, unknown[]>(cliprJobs.list)(
        listCtx.ctx,
        {},
      ),
    ).resolves.toEqual([
      expect.objectContaining({
        avatarImageObject: imageObject,
        avatarVideoObject: videoObject,
        completedAt: now,
        finalClipId: "clip_1",
        id: "job_1",
      }),
    ]);
    expect(listCtx.ctx.db.query).toHaveBeenCalledWith("cliprJobs");
    expect(listCtx.queryChains[0].chain.order).toHaveBeenCalledWith("desc");
    expect(listCtx.queryChains[0].chain.take).toHaveBeenCalledWith(20);

    const getCtx = createCtx({ cliprJobs: [{ unique: job }] });

    await expect(
      getHandler<{ id: string }, unknown>(cliprJobs.get)(getCtx.ctx, {
        id: "job_1",
      }),
    ).resolves.toEqual(expect.objectContaining({ id: "job_1" }));
    expect(getCtx.queryChains[0].indexQuery.eq).toHaveBeenCalledWith(
      "ownerId",
      "owner_123",
    );
    expect(getCtx.queryChains[0].indexQuery.eq).toHaveBeenCalledWith(
      "id",
      "job_1",
    );
  });

  it("creates queued jobs behind the API secret and write limiter", async () => {
    const { ctx } = createCtx();
    (ctx.db as typeof ctx.db & { get: ReturnType<typeof vi.fn> }).get = vi.fn(
      async () => createJob(),
    );

    await expect(
      getHandler<Record<string, unknown>, unknown>(cliprJobs.createQueued)(
        ctx,
        createQueuedArgs(),
      ),
    ).resolves.toEqual(expect.objectContaining({ id: "job_1" }));

    expect(mocks.assertRateLimitApiSecret).toHaveBeenCalledWith("secret");
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexCliprJobWrite",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "cliprJobs",
      expect.objectContaining({
        ownerId: "owner_123",
        progress: 0.08,
        scenePlan: [],
        stage: "hook-script",
        status: "scripting",
        updatedAt: now,
      }),
    );
  });

  it("applies script plans and de-duplicates provider models", async () => {
    const { ctx } = createCtx({
      cliprJobs: [{ unique: createJob() }],
    });
    const args = {
      filledHook: "New hook",
      hookStyleKey: "curiosity",
      hookTemplateId: "template_2",
      id: "job_1",
      providerModel: "new-model",
      scenePlan: [createScenePlan({ id: "scene_2" })],
      script: "New script",
      secret: "secret",
      updatedAt: now,
      variablesUsed: { product: "Product" },
    };

    await getHandler<typeof args, void>(cliprJobs.applyScriptPlan)(ctx, args);

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "job_doc",
      expect.objectContaining({
        filledHook: "New hook",
        progress: 0.25,
        providerModels: ["existing-model", "new-model"],
        stage: "avatar-image",
        status: "generating-avatar-image",
      }),
    );
  });

  it("rejects script updates for missing jobs", async () => {
    const { ctx } = createCtx({ cliprJobs: [{ unique: null }] });

    await expect(
      getHandler<Record<string, unknown>, void>(cliprJobs.applyScriptPlan)(
        ctx,
        {
          filledHook: "Hook",
          hookStyleKey: "style",
          hookTemplateId: "template",
          id: "missing",
          providerModel: "model",
          scenePlan: [],
          script: "Script",
          secret: "secret",
          updatedAt: now,
          variablesUsed: {},
        },
      ),
    ).rejects.toThrow("Clipr job not found.");
  });

  it("records avatar image output and advances to video generation", async () => {
    const { ctx } = createCtx({
      cliprJobs: [{ unique: createJob() }],
    });
    const args = {
      avatarImageObject: imageObject,
      avatarImageProviderPredictionId: "image_prediction_1",
      id: "job_1",
      progress: 0.4,
      providerModels: ["existing-model", "image-model"],
      secret: "secret",
      updatedAt: now,
    };

    await getHandler<typeof args, void>(cliprJobs.recordAvatarImageOutput)(
      ctx,
      args,
    );

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "job_doc",
      expect.objectContaining({
        avatarImageObject: imageObject,
        avatarImageProviderPredictionId: "image_prediction_1",
        progress: 0.4,
        providerModels: ["existing-model", "image-model"],
        stage: "avatar-video",
        status: "generating-avatar-video",
      }),
    );
  });

  it("records avatar video output, optional music, and returns client fields", async () => {
    const { ctx } = createCtx({
      cliprJobs: [{ unique: createJob() }],
    });
    const music = {
      audioObject,
      createdAt: now,
      durationSeconds: 30,
      enabled: true,
      prompt: "bright synth",
      providerModel: "music-model",
      providerPredictionId: "music_prediction_1",
      tags: ["clipr"],
      title: "Bright Synth",
      updatedAt: now,
      volume: 0.4,
    };
    const args = {
      avatarVideoObject: videoObject,
      avatarVideoProviderPredictionId: "video_prediction_1",
      id: "job_1",
      music,
      progress: 0.68,
      providerModels: ["video-model"],
      secret: "secret",
      updatedAt: now,
    };

    await expect(
      getHandler<typeof args, unknown>(cliprJobs.recordAvatarVideoOutput)(
        ctx,
        args,
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        avatarVideoObject: videoObject,
        music,
        stage: "browser-save",
        status: "ready-to-save",
      }),
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "job_doc",
      expect.objectContaining({
        avatarVideoObject: videoObject,
        avatarVideoProviderPredictionId: "video_prediction_1",
        music,
        providerModels: ["existing-model", "video-model"],
      }),
    );
  });

  it("marks browser saving without lowering existing progress", async () => {
    const { ctx } = createCtx({
      cliprJobs: [{ unique: createJob({ progress: 0.9 }) }],
    });

    await getHandler<{ id: string; updatedAt: string }, void>(
      cliprJobs.markBrowserSaving,
    )(ctx, { id: "job_1", updatedAt: now });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "job_doc",
      expect.objectContaining({
        progress: 0.9,
        stage: "browser-save",
        status: "saving",
      }),
    );
  });

  it("finalizes jobs by inserting the library clip and completing the job", async () => {
    const { ctx } = createCtx({
      cliprJobs: [
        {
          unique: createJob({
            avatarVideoObject: videoObject,
            music: {
              audioObject,
              createdAt: now,
              durationSeconds: 30,
              enabled: true,
              prompt: "music",
              providerModel: "music-model",
              providerPredictionId: "music_prediction_1",
              updatedAt: now,
              volume: 0.5,
            },
          }),
        },
      ],
    });
    const args = {
      aspectRatio: 9 / 16,
      clipId: "clip_1",
      duration: 30,
      hasAudio: true,
      height: 1920,
      id: "job_1",
      mimeType: "video/mp4",
      name: "Product Clipr",
      originalSize: 200,
      posterObject: imageObject,
      posterVersion: 1,
      size: 100,
      sourceMimeType: "video/mp4",
      updatedAt: now,
      videoObject,
      width: 1080,
    };

    await expect(
      getHandler<typeof args, string>(cliprJobs.finalizeWithClip)(ctx, args),
    ).resolves.toBe("clip_1");
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexRecordSave",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "videoClips",
      expect.objectContaining({
        cliprMetadata: expect.objectContaining({
          filledHook: "Hook",
          jobId: "job_1",
          music: expect.objectContaining({ prompt: "music" }),
          productId: "product_1",
          providerModels: ["existing-model"],
          sceneCount: 1,
        }),
        id: "clip_1",
        ownerId: "owner_123",
        tags: ["ugc", "clipr"],
      }),
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "job_doc",
      expect.objectContaining({
        completedAt: now,
        finalClipId: "clip_1",
        progress: 1,
        stage: "finalized",
        status: "completed",
      }),
    );
  });

  it("keeps finalization idempotent and rejects incomplete script metadata", async () => {
    const idempotentCtx = createCtx({
      cliprJobs: [{ unique: createJob({ finalClipId: "existing_clip" }) }],
    });
    const finalizeArgs = {
      aspectRatio: 9 / 16,
      clipId: "clip_1",
      duration: 30,
      hasAudio: true,
      height: 1920,
      id: "job_1",
      mimeType: "video/mp4",
      name: "Product Clipr",
      originalSize: 200,
      size: 100,
      sourceMimeType: "video/mp4",
      updatedAt: now,
      videoObject,
      width: 1080,
    };

    await expect(
      getHandler<typeof finalizeArgs, string>(cliprJobs.finalizeWithClip)(
        idempotentCtx.ctx,
        finalizeArgs,
      ),
    ).resolves.toBe("existing_clip");
    expect(idempotentCtx.ctx.db.insert).not.toHaveBeenCalled();

    const incompleteCtx = createCtx({
      cliprJobs: [{ unique: createJob({ script: undefined }) }],
    });

    await expect(
      getHandler<typeof finalizeArgs, string>(cliprJobs.finalizeWithClip)(
        incompleteCtx.ctx,
        finalizeArgs,
      ),
    ).rejects.toThrow("Clipr job is missing script metadata.");
  });

  it("fails and cancels jobs with owner-scoped lookups", async () => {
    const failCtx = createCtx({ cliprJobs: [{ unique: createJob() }] });

    await expect(
      getHandler<
        { error: string; id: string; secret: string; updatedAt: string },
        null
      >(cliprJobs.fail)(failCtx.ctx, {
        error: "provider failed",
        id: "job_1",
        secret: "secret",
        updatedAt: now,
      }),
    ).resolves.toBeNull();
    expect(failCtx.ctx.db.patch).toHaveBeenCalledWith(
      "job_doc",
      expect.objectContaining({
        error: "provider failed",
        stage: "failed",
        status: "failed",
      }),
    );

    const cancelCtx = createCtx({ cliprJobs: [{ unique: createJob() }] });

    await expect(
      getHandler<{ id: string; updatedAt: string }, unknown>(cliprJobs.cancel)(
        cancelCtx.ctx,
        {
          id: "job_1",
          updatedAt: now,
        },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        id: "job_1",
        stage: "canceled",
        status: "canceled",
      }),
    );
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      cancelCtx.ctx,
      "cliprJobCancel",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(cancelCtx.ctx.db.patch).toHaveBeenCalledWith(
      "job_doc",
      expect.objectContaining({
        stage: "canceled",
        status: "canceled",
      }),
    );
  });
});
