import { describe, expect, it, vi } from "vitest";
import { holdFutureTargetsForSocialAccount } from "./holdFutureTargetsForSocialAccount";

const mocks = vi.hoisted(() => ({
  refreshSocialPostStatus: vi.fn(),
}));

vi.mock("../socialPosts/refreshSocialPostStatus", () => ({
  refreshSocialPostStatus: mocks.refreshSocialPostStatus,
}));

function createChain(rows: unknown[]) {
  const index = { eq: vi.fn(() => index) };
  const chain = {
    collect: vi.fn(async () => rows),
    withIndex: vi.fn(
      (_name: string, callback: (value: typeof index) => void) => {
        callback(index);
        return chain;
      },
    ),
  };

  return chain;
}

describe("holdFutureTargetsForSocialAccount", () => {
  it("holds only the disconnected owner's future deliveries", async () => {
    const future = {
      _id: "future_doc",
      ownerId: "owner_1",
      postId: "post_1",
      scheduledFor: "2026-08-02T00:00:00.000Z",
    };
    const otherOwner = {
      _id: "other_doc",
      ownerId: "owner_2",
      postId: "post_2",
      scheduledFor: "2026-08-02T00:00:00.000Z",
    };
    const past = {
      _id: "past_doc",
      ownerId: "owner_1",
      postId: "post_3",
      scheduledFor: "2026-07-01T00:00:00.000Z",
    };
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi
          .fn()
          .mockReturnValueOnce(createChain([future, otherOwner, past]))
          .mockReturnValueOnce(createChain([])),
      },
    };

    await expect(
      holdFutureTargetsForSocialAccount(ctx as never, {
        accountId: "account_1",
        now: "2026-08-01T00:00:00.000Z",
        ownerId: "owner_1",
        reason: "Reconnect",
      }),
    ).resolves.toBe(1);
    expect(ctx.db.patch).toHaveBeenCalledTimes(1);
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "future_doc",
      expect.objectContaining({ status: "held", nextAttemptAt: undefined }),
    );
  });
});
