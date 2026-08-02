import { beforeEach, describe, expect, it, vi } from "vitest";
import { commit } from "./commit";
import type { SwipePublishingBundle } from "../../lib/clipstitchr/publishing/media/SwipePublishingBundle";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  createEditableDigest: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  limit: vi.fn(),
  mutation: vi.fn((definition) => definition),
  upsertSwipeCard: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: { limit: mocks.limit } }));
vi.mock("../upsertSwipeCard", () => ({
  upsertSwipeCard: mocks.upsertSwipeCard,
}));
vi.mock(
  "../../lib/clipstitchr/publishing/media/createSwipePublishingEditableStateDigest",
  () => ({
    createSwipePublishingEditableStateDigest: mocks.createEditableDigest,
  }),
);

const checksumSha256 = `${"A".repeat(43)}=`;

function createBundle(revisionCharacter: string): SwipePublishingBundle {
  const revision = revisionCharacter.repeat(64);

  return {
    backgrounds: [
      {
        contentType: "image/jpeg",
        id: "background_1",
        objectKey: "users/user_123/swipr-backgrounds/background_1/image.jpg",
        sizeBytes: 100,
        version: 'etag:"background"',
      },
    ],
    createdAt: "2026-08-02T00:00:00.000Z",
    editableStateDigest: "d".repeat(64),
    rendererVersion: "swipr-canvas-1080x1920-jpeg-q92-v1",
    revision,
    slides: Array.from({ length: 3 }, (_, index) => ({
      checksumSha256,
      height: 1920,
      index,
      object: {
        contentType: "image/jpeg",
        key: `users/user_123/swipes/swipe_123/publishing/${revision}/slide-${String(index + 1).padStart(2, "0")}-${"A".repeat(43)}.jpg`,
        size: 1_000 + index,
      },
      width: 1080,
    })),
  };
}

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(status: "reserved" | "committed" = "reserved") {
  const bundle = createBundle("b");
  const oldBundle = createBundle("a");
  const attempts = [
    {
      _id: "attempt_doc_1",
      attemptId: "attempt_1",
      bundle,
      ownerId: "user_123",
      status,
      swipeId: "swipe_123",
    },
  ];
  const swipe = {
    _id: "swipe_doc_1",
    backgroundId: "background_1",
    id: "swipe_123",
    ownerId: "user_123",
    slides: [{}, {}, {}],
  };
  const history = [
    {
      _id: "history_old",
      bundle: oldBundle,
      ownerId: "user_123",
      revision: oldBundle.revision,
      swipeId: "swipe_123",
    },
  ];
  const insert = vi.fn(async (table: string, value: Record<string, unknown>) => {
    if (table === "swipePublishingBundleHistory") {
      history.push({
        _id: "history_new",
        bundle: value.bundle as SwipePublishingBundle,
        ownerId: value.ownerId as string,
        revision: value.revision as string,
        swipeId: value.swipeId as string,
      });
    }

    return "new_doc";
  });
  const ctx = {
    db: {
      delete: vi.fn(),
      get: vi.fn(async () => swipe),
      insert,
      patch: vi.fn(),
      query: vi.fn((table: string) => {
        const filters: Record<string, string> = {};
        const index = {
          eq: vi.fn((field: string, value: string) => {
            filters[field] = value;
            return index;
          }),
        };
        const chain = {
          unique: vi.fn(async () => {
            if (table === "swipePublishingUploadAttempts") {
              return attempts.find(
                (attempt) => attempt.attemptId === filters.attemptId,
              );
            }

            if (table === "swipes") {
              return swipe.id === filters.id ? swipe : null;
            }

            if (table === "swipePublishingBundleHistory") {
              return (
                history.find(
                  (entry) =>
                    entry.ownerId === filters.ownerId &&
                    entry.swipeId === filters.swipeId &&
                    entry.revision === filters.revision,
                ) ?? null
              );
            }

            return null;
          }),
          withIndex: vi.fn(
            (_name: string, applyIndex: (value: typeof index) => unknown) => {
              applyIndex(index);
              return chain;
            },
          ),
        };

        return chain;
      }),
    },
  };

  return { bundle, ctx, history, oldBundle };
}

describe("swipePublishingBundles.commit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-02T01:00:00.000Z"));
    mocks.getAuthenticatedOwnerId.mockResolvedValue("user_123");
    mocks.createEditableDigest.mockResolvedValue("d".repeat(64));
  });

  it("commits idempotent metadata while preserving every historical revision", async () => {
    const { bundle, ctx, history, oldBundle } = createContext();

    await expect(
      getHandler<{ attemptId: string; secret: string }, SwipePublishingBundle>(commit)(ctx, {
        attemptId: "attempt_1",
        secret: "server-secret",
      }),
    ).resolves.toEqual(bundle);

    expect(history.map((entry) => entry.revision)).toEqual([
      oldBundle.revision,
      bundle.revision,
    ]);
    expect(ctx.db.delete).not.toHaveBeenCalled();
    expect(ctx.db.patch).toHaveBeenCalledWith("swipe_doc_1", {
      publishingBundle: bundle,
      publishingRevision: bundle.revision,
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "attempt_doc_1",
      expect.objectContaining({ status: "committed" }),
    );
    expect(mocks.upsertSwipeCard).toHaveBeenCalledTimes(1);
    expect(mocks.assertRateLimitApiSecret).toHaveBeenCalledWith("server-secret");
  });

  it("returns an already committed attempt without another write or quota charge", async () => {
    const { bundle, ctx } = createContext("committed");

    await expect(
      getHandler<{ attemptId: string; secret: string }, SwipePublishingBundle>(commit)(ctx, {
        attemptId: "attempt_1",
        secret: "server-secret",
      }),
    ).resolves.toEqual(bundle);
    expect(mocks.limit).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("rejects a browser-direct finalization before owner or database work", async () => {
    const { ctx } = createContext();
    mocks.assertRateLimitApiSecret.mockImplementationOnce(() => {
      throw new Error("Not authorized to consume server rate limits.");
    });

    await expect(
      getHandler<
        { attemptId: string; secret: string },
        SwipePublishingBundle
      >(commit)(ctx, {
        attemptId: "attempt_1",
        secret: "browser-value",
      }),
    ).rejects.toThrow("Not authorized");
    expect(mocks.getAuthenticatedOwnerId).not.toHaveBeenCalled();
    expect(ctx.db.query).not.toHaveBeenCalled();
  });
});
