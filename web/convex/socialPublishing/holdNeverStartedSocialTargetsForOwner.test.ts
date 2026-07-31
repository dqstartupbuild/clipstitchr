import { beforeEach, describe, expect, it, vi } from "vitest";
import { holdNeverStartedSocialTargetsForOwner } from "./holdNeverStartedSocialTargetsForOwner";

const mocks = vi.hoisted(() => ({
  refreshSocialPostStatus: vi.fn(),
}));

vi.mock("../socialPosts/refreshSocialPostStatus", () => ({
  refreshSocialPostStatus: mocks.refreshSocialPostStatus,
}));

function createContext() {
  const targets = {
    queued: [
      {
        _id: "target_queued",
        postId: "post_queued",
      },
    ],
    scheduled: [
      {
        _id: "target_claimed",
        claimedAt: "2026-07-29T12:00:00.000Z",
        postId: "post_claimed",
      },
    ],
  };

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn(() => {
        const query = {
          collect: vi.fn(),
          withIndex: vi.fn(
            (
              _indexName: string,
              select: (index: {
                eq: (field: string, value: string) => unknown;
              }) => unknown,
            ) => {
              let selectedStatus = "";
              const index = {
                eq: (field: string, value: string) => {
                  if (field === "status") {
                    selectedStatus = value;
                  }
                  return index;
                },
              };
              select(index);
              query.collect.mockResolvedValue(
                targets[selectedStatus as keyof typeof targets] ?? [],
              );
              return query;
            },
          ),
        };

        return query;
      }),
    },
  };
}

describe("holdNeverStartedSocialTargetsForOwner", () => {
  beforeEach(() => vi.clearAllMocks());

  it("counts only targets that were actually held", async () => {
    const ctx = createContext();

    await expect(
      holdNeverStartedSocialTargetsForOwner(ctx as never, {
        now: "2026-07-29T13:00:00.000Z",
        ownerId: "owner_1",
        reason: "Subscription inactive - scheduled posts held.",
      }),
    ).resolves.toBe(1);

    expect(ctx.db.patch).toHaveBeenCalledTimes(1);
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "target_queued",
      expect.objectContaining({ status: "held" }),
    );
    expect(mocks.refreshSocialPostStatus).toHaveBeenCalledOnce();
    expect(mocks.refreshSocialPostStatus).toHaveBeenCalledWith(
      ctx,
      "owner_1",
      "post_queued",
      "2026-07-29T13:00:00.000Z",
    );
  });
});
