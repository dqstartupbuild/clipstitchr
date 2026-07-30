import { beforeEach, describe, expect, it, vi } from "vitest";
import { recordSocialAnalyticsPublicationResult } from "./recordSocialAnalyticsPublicationResult";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertProviderWorkerSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));

function createContext(existingSnapshots: unknown[] = []) {
  const records: Record<string, unknown> = {
    socialAnalyticsRefreshRuns: {
      _id: "run_doc",
      id: "run_1",
      progress: 0,
      completedPublicationCount: 0,
      failedPublicationCount: 0,
      requestedPublicationCount: 1,
    },
    socialExternalPublications: {
      _id: "publication_doc",
      id: "publication_1",
      postId: "post_1",
      targetId: "target_1",
      socialAccountId: "account_1",
      platform: "tiktok",
    },
    socialPosts: {
      _id: "post_doc",
      id: "post_1",
      productId: "product_1",
    },
  };

  return {
    db: {
      insert: vi.fn(),
      patch: vi.fn(),
      query: vi.fn((table: string) => {
        const index = { eq: vi.fn(() => index) };
        const chain = {
          collect: vi.fn(async () =>
            table === "socialAnalyticsSnapshots" ? existingSnapshots : [],
          ),
          filter: vi.fn(() => chain),
          unique: vi.fn(async () => records[table]),
          withIndex: vi.fn(
            (_name: string, callback: (value: typeof index) => void) => {
              callback(index);
              return chain;
            },
          ),
        };

        return chain;
      }),
    },
  };
}

const args = {
  secret: "worker",
  ownerId: "owner_1",
  refreshRunId: "run_1",
  publicationId: "publication_1",
  snapshots: [
    {
      source: "tiktok_official",
      views: 100,
      reach: null,
      likes: 10,
      comments: 2,
      shares: 1,
      saves: null,
      watchTimeSeconds: null,
      availabilityJson: '{"saves":"unavailable"}',
    },
  ],
  succeeded: true,
  now: "2026-08-01T12:00:00.000Z",
};

describe("recordSocialAnalyticsPublicationResult", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores a cumulative manual snapshot without converting missing metrics to zero", async () => {
    const ctx = createContext();
    const handler = (
      recordSocialAnalyticsPublicationResult as unknown as ConvexFunction
    ).handler;

    await expect(handler(ctx, args)).resolves.toEqual({
      alreadyRecorded: false,
      progress: 1,
    });
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "socialAnalyticsSnapshots",
      expect.objectContaining({
        capturedAt: args.now,
        views: 100,
        saves: null,
        refreshRunId: "run_1",
      }),
    );
  });

  it("does not duplicate snapshots when a refresh job is retried", async () => {
    const ctx = createContext([{ _id: "snapshot_doc" }]);
    const handler = (
      recordSocialAnalyticsPublicationResult as unknown as ConvexFunction
    ).handler;

    await expect(handler(ctx, args)).resolves.toEqual({
      alreadyRecorded: true,
      progress: 0,
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
