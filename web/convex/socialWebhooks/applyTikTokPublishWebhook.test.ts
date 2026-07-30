import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyTikTokPublishWebhook } from "./applyTikTokPublishWebhook";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  createNotification: vi.fn(),
  mutation: vi.fn((definition) => definition),
  refreshSocialPostStatus: vi.fn(),
  revokeSocialMediaAccessGrants: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));
vi.mock("../createNotification", () => ({
  createNotification: mocks.createNotification,
}));
vi.mock("../socialMedia/revokeSocialMediaAccessGrants", () => ({
  revokeSocialMediaAccessGrants: mocks.revokeSocialMediaAccessGrants,
}));
vi.mock("../socialPosts/refreshSocialPostStatus", () => ({
  refreshSocialPostStatus: mocks.refreshSocialPostStatus,
}));

function createContext({
  attemptStatus,
  targetStatus,
}: {
  attemptStatus?: string;
  targetStatus?: string;
} = {}) {
  const index = { eq: vi.fn(() => index) };
  const attempt = {
    _id: "attempt_doc",
    id: "attempt_1",
    ownerId: "owner_1",
    postId: "post_1",
    status: attemptStatus,
    targetId: "target_1",
  };
  const target = {
    _id: "target_doc",
    id: "target_1",
    platform: "tiktok",
    socialAccountId: "account_1",
    status: targetStatus,
  };

  return {
    db: {
      insert: vi.fn(),
      patch: vi.fn(),
      query: vi.fn((table: string) => {
        const value =
          table === "socialPublishAttempts"
            ? attempt
            : table === "socialPostTargets"
              ? target
              : null;
        const chain = {
          unique: vi.fn(async () => value),
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

describe("applyTikTokPublishWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cleans up provider media after a definitive webhook failure", async () => {
    const ctx = createContext();
    const handler = (applyTikTokPublishWebhook as unknown as ConvexFunction)
      .handler;

    await handler(ctx, {
      secret: "api",
      publishId: "publish_1",
      status: "failed",
      publicationIds: [],
      errorMessage: "TikTok rejected this post.",
      now: "2026-08-01T00:00:00.000Z",
    });

    expect(mocks.revokeSocialMediaAccessGrants).toHaveBeenCalledWith(
      ctx,
      "owner_1",
      "target_1",
      "2026-08-01T00:00:00.000Z",
    );
    expect(mocks.createNotification).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ title: "A social post did not go out" }),
    );
  });

  it("marks a completed webhook delivery terminal before cleanup", async () => {
    const ctx = createContext();
    const handler = (applyTikTokPublishWebhook as unknown as ConvexFunction)
      .handler;

    await handler(ctx, {
      secret: "api",
      publishId: "publish_1",
      status: "complete",
      publicationIds: [],
      now: "2026-08-01T00:00:00.000Z",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "attempt_doc",
      expect.objectContaining({
        retrySafety: "terminal",
        status: "succeeded",
      }),
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "target_doc",
      expect.objectContaining({
        nextAttemptAt: undefined,
        status: "waiting_for_user",
      }),
    );
    expect(mocks.revokeSocialMediaAccessGrants).toHaveBeenCalledOnce();
  });

  it("does not downgrade a confirmed publication when events arrive out of order", async () => {
    const ctx = createContext({
      attemptStatus: "succeeded",
      targetStatus: "published",
    });
    const handler = (applyTikTokPublishWebhook as unknown as ConvexFunction)
      .handler;

    await handler(ctx, {
      secret: "api",
      publishId: "publish_1",
      status: "failed",
      publicationIds: [],
      errorMessage: "Late failure event.",
      now: "2026-08-01T00:00:00.000Z",
    });

    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.createNotification).not.toHaveBeenCalled();
    expect(mocks.revokeSocialMediaAccessGrants).toHaveBeenCalledOnce();
  });
});
