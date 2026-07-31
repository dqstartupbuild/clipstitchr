import { beforeEach, describe, expect, it, vi } from "vitest";
import { failSocialTargetAfterRetryLimit } from "./failSocialTargetAfterRetryLimit";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertProviderWorkerSecret: vi.fn(),
  createNotification: vi.fn(),
  mutation: vi.fn((definition) => definition),
  refreshSocialPostStatus: vi.fn(),
  revokeSocialMediaAccessGrants: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
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
  providerPublishId,
  retrySafety = "safe_before_provider_call",
  targetStatus,
}: {
  providerPublishId?: string;
  retrySafety?: string;
  targetStatus?: string;
} = {}) {
  const index = { eq: vi.fn(() => index) };
  const target = {
    _id: "target_doc",
    id: "target_1",
    postId: "post_1",
    status: targetStatus,
  };
  const attempts = [
    {
      _id: "attempt_doc",
      id: "attempt_1",
      attemptNumber: 1,
      providerPublishId,
      retrySafety,
      status: "running",
    },
  ];
  const chain = {
    collect: vi.fn(async () => attempts),
    unique: vi.fn(async () => target),
    withIndex: vi.fn(
      (name: string, callback: (value: typeof index) => void) => {
        callback(index);
        return name === "by_owner_target"
          ? { ...chain, collect: vi.fn(async () => attempts) }
          : chain;
      },
    ),
  };

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn(() => chain),
    },
  };
}

describe("failSocialTargetAfterRetryLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revokes provider-fetch grants after the final worker retry", async () => {
    const ctx = createContext();
    const handler = (
      failSocialTargetAfterRetryLimit as unknown as ConvexFunction
    ).handler;

    await expect(
      handler(ctx, {
        secret: "worker",
        ownerId: "owner_1",
        postId: "post_1",
        targetId: "target_1",
        errorMessage: "Provider retries were exhausted.",
        now: "2026-08-01T00:00:00.000Z",
      }),
    ).resolves.toBe(true);

    expect(mocks.revokeSocialMediaAccessGrants).toHaveBeenCalledWith(
      ctx,
      "owner_1",
      "target_1",
      "2026-08-01T00:00:00.000Z",
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "target_doc",
      expect.objectContaining({
        nextAttemptAt: undefined,
        status: "failed",
      }),
    );
    expect(mocks.createNotification).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        sourceId: "post_1",
        title: "A social post did not go out",
      }),
    );
  });

  it("never makes an accepted provider publish automatically resumable", async () => {
    const ctx = createContext({ providerPublishId: "publish_1" });
    const handler = (
      failSocialTargetAfterRetryLimit as unknown as ConvexFunction
    ).handler;

    await handler(ctx, {
      secret: "worker",
      ownerId: "owner_1",
      postId: "post_1",
      targetId: "target_1",
      errorMessage: "TikTok status checks were exhausted.",
      now: "2026-08-01T00:00:00.000Z",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "attempt_doc",
      expect.objectContaining({
        retrySafety: "do_not_retry_reconcile_only",
        status: "ambiguous",
      }),
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "target_doc",
      expect.objectContaining({
        outcomeUnknownAt: "2026-08-01T00:00:00.000Z",
        status: "outcome_unknown",
      }),
    );
    expect(mocks.createNotification).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        message: expect.stringContaining(
          "will not send it again automatically",
        ),
        title: "This post needs a careful check",
      }),
    );
  });

  it("does not downgrade a target completed by a concurrent webhook", async () => {
    const ctx = createContext({ targetStatus: "published" });
    const handler = (
      failSocialTargetAfterRetryLimit as unknown as ConvexFunction
    ).handler;

    await handler(ctx, {
      secret: "worker",
      ownerId: "owner_1",
      postId: "post_1",
      targetId: "target_1",
      errorMessage: "Late retry failure.",
      now: "2026-08-01T00:00:00.000Z",
    });

    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.createNotification).not.toHaveBeenCalled();
    expect(mocks.revokeSocialMediaAccessGrants).toHaveBeenCalledOnce();
  });
});
