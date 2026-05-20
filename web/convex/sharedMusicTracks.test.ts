import { beforeEach, describe, expect, it, vi } from "vitest";
import { get, list, save } from "./sharedMusicTracks";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
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

vi.mock("./auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));

vi.mock("./rateLimiter", () => ({
  rateLimiter: mocks.rateLimiter,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(options: {
  collect?: unknown[];
  take?: unknown[];
  unique?: unknown;
} = {}) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    collect: vi.fn(async () => options.collect ?? []),
    order: vi.fn(() => chain),
    take: vi.fn(async () => options.take ?? []),
    unique: vi.fn(async () => options.unique ?? null),
    withIndex: vi.fn(
      (_indexName: string, callback?: (q: typeof indexQuery) => void) => {
        callback?.(indexQuery);

        return chain;
      },
    ),
  };

  return chain;
}

function createTrack(overrides: Record<string, unknown> = {}) {
  return {
    _id: "doc_1",
    audioObject: {
      contentType: "audio/mpeg",
      key: "shared/music/track_1.mp3",
      size: 10,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 30,
    id: "track_1",
    mimeType: "audio/mpeg",
    ownerAudioObject: {
      contentType: "audio/mpeg",
      key: "users/owner_123/music/track_1.mp3",
      size: 10,
    },
    prompt: "prompt",
    providerModel: "model",
    providerPredictionId: "prediction_1",
    size: 10,
    source: "library",
    style: "Launch Kit",
    tags: ["upbeat"],
    title: "Generated Track",
    uploadedByOwnerId: "owner_123",
    ...overrides,
  };
}

function createSaveArgs(overrides: Record<string, unknown> = {}) {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "shared/music/track_1.mp3",
      size: 10,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 30,
    id: "track_1",
    mimeType: "audio/mpeg",
    ownerAudioObject: {
      contentType: "audio/mpeg",
      key: "users/owner_123/music/track_1.mp3",
      size: 10,
    },
    prompt: "  prompt  ",
    providerModel: "model",
    providerPredictionId: "prediction_1",
    size: 10,
    source: "library",
    style: "  Launch Kit  ",
    tags: [" Upbeat ", "upbeat", "", "Creator"],
    title: "  Generated Track  ",
    ...overrides,
  };
}

describe("convex sharedMusicTracks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("lists tracks and hides owner objects for tracks owned by others", async () => {
    const queryChain = createQueryChain({
      take: [
        createTrack(),
        createTrack({
          id: "track_2",
          ownerAudioObject: { key: "users/other/music/track_2.mp3" },
          uploadedByOwnerId: "owner_456",
        }),
      ],
    });
    const ctx = {
      db: {
        query: vi.fn(() => queryChain),
      },
    };

    await expect(getHandler(list)(ctx, {})).resolves.toEqual([
      expect.objectContaining({
        id: "track_1",
        isOwnedByCurrentUser: true,
        ownerAudioObject: expect.objectContaining({
          key: "users/owner_123/music/track_1.mp3",
        }),
      }),
      expect.objectContaining({
        id: "track_2",
        isOwnedByCurrentUser: false,
        ownerAudioObject: undefined,
      }),
    ]);
    expect(queryChain.withIndex).toHaveBeenCalledWith("by_created");
    expect(queryChain.order).toHaveBeenCalledWith("desc");
    expect(queryChain.take).toHaveBeenCalledWith(200);
  });

  it("gets one track by music id", async () => {
    const queryChain = createQueryChain({ unique: createTrack() });
    const ctx = {
      db: {
        query: vi.fn(() => queryChain),
      },
    };

    await expect(getHandler(get)(ctx, { id: "track_1" })).resolves.toEqual(
      expect.objectContaining({
        id: "track_1",
        isOwnedByCurrentUser: true,
      }),
    );
    expect(queryChain.withIndex).toHaveBeenCalledWith(
      "by_music_id",
      expect.any(Function),
    );
  });

  it("normalizes and saves a new shared music track", async () => {
    const queryChain = createQueryChain();
    const ctx = {
      db: {
        insert: vi.fn(async () => "doc_1"),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(getHandler(save)(ctx, createSaveArgs())).resolves.toBe(
      "doc_1",
    );
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexRecordSave",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "sharedMusicTracks",
      expect.objectContaining({
        prompt: "prompt",
        style: "Launch Kit",
        tags: ["upbeat", "creator"],
        title: "Generated Track",
        uploadedByOwnerId: "owner_123",
      }),
    );
  });

  it("rejects blank or duplicate track titles before consuming quota", async () => {
    const ctx = {
      db: {
        insert: vi.fn(),
        query: vi.fn(() => createQueryChain()),
      },
    };

    await expect(
      getHandler(save)(ctx, createSaveArgs({ title: "   " })),
    ).rejects.toThrow("Music title is required.");
    expect(mocks.rateLimiter.limit).not.toHaveBeenCalled();

    ctx.db.query.mockReturnValueOnce(createQueryChain({ unique: createTrack() }));
    await expect(getHandler(save)(ctx, createSaveArgs())).rejects.toThrow(
      "Music track already exists.",
    );
  });
});
