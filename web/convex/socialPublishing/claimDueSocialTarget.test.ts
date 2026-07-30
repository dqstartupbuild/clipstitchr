import { beforeEach, describe, expect, it, vi } from "vitest";
import { claimDueSocialTarget } from "./claimDueSocialTarget";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertOwnerCanPublishSocial: vi.fn(),
  enqueueSocialTargetProviderJob: vi.fn(),
  internalMutation: vi.fn((definition) => definition),
  refreshSocialPostStatus: vi.fn(),
}));

vi.mock("../_generated/server", () => ({
  internalMutation: mocks.internalMutation,
}));
vi.mock("../billing/assertOwnerCanPublishSocial", () => ({
  assertOwnerCanPublishSocial: mocks.assertOwnerCanPublishSocial,
}));
vi.mock("./enqueueSocialTargetProviderJob", () => ({
  enqueueSocialTargetProviderJob: mocks.enqueueSocialTargetProviderJob,
}));
vi.mock("../socialPosts/refreshSocialPostStatus", () => ({
  refreshSocialPostStatus: mocks.refreshSocialPostStatus,
}));

function createContext() {
  const records: Record<string, unknown> = {
    socialPostTargets: {
      _id: "target_doc",
      id: "target_1",
      ownerId: "owner_1",
      postId: "post_1",
      socialAccountId: "account_1",
      scheduledFor: "2026-08-01T12:00:00.000Z",
      status: "scheduled",
    },
    socialPosts: {
      _id: "post_doc",
      id: "post_1",
      ownerId: "owner_1",
    },
    socialAccounts: {
      _id: "account_doc",
      id: "account_1",
      ownerId: "owner_1",
      status: "connected",
    },
  };

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn((table: string) => {
        const index = { eq: vi.fn(() => index) };
        const chain = {
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

describe("claimDueSocialTarget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("holds a due target when entitlement changed before execution", async () => {
    mocks.assertOwnerCanPublishSocial.mockRejectedValue(
      new Error("inactive"),
    );
    const ctx = createContext();
    const handler = (claimDueSocialTarget as unknown as ConvexFunction).handler;

    await expect(
      handler(ctx, {
        targetId: "target_1",
        now: "2026-08-01T12:01:00.000Z",
      }),
    ).resolves.toBeNull();
    expect(mocks.enqueueSocialTargetProviderJob).not.toHaveBeenCalled();
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "target_doc",
      expect.objectContaining({
        status: "held",
        nextAttemptAt: undefined,
      }),
    );
  });
});
