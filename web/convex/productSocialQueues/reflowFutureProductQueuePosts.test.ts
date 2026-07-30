import { beforeEach, describe, expect, it, vi } from "vitest";
import { reflowFutureProductQueuePosts } from "./reflowFutureProductQueuePosts";

const mocks = vi.hoisted(() => ({
  findAvailableSocialQueueSlot: vi.fn(),
}));

vi.mock("./findAvailableSocialQueueSlot", () => ({
  findAvailableSocialQueueSlot: mocks.findAvailableSocialQueueSlot,
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

describe("reflowFutureProductQueuePosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findAvailableSocialQueueSlot.mockResolvedValue({
      queueSlotKey: "product_1:new_slot",
      scheduledFor: "2026-08-10T14:00:00.000Z",
    });
  });

  it("moves only future not-started queue posts and their targets", async () => {
    const queuePost = {
      _id: "queue_post_doc",
      id: "queue_post",
      scheduleMode: "product_queue",
      status: "scheduled",
      scheduledFor: "2026-08-05T14:00:00.000Z",
      createdAt: "2026-08-01T00:00:00.000Z",
    };
    const exactPost = {
      _id: "exact_post_doc",
      id: "exact_post",
      scheduleMode: "exact_time",
      status: "scheduled",
      scheduledFor: "2026-08-05T15:00:00.000Z",
      createdAt: "2026-08-01T00:01:00.000Z",
    };
    const target = {
      _id: "target_doc",
      id: "target_1",
      status: "scheduled",
    };
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi.fn((table: string) =>
          createChain(
            table === "socialPosts" ? [queuePost, exactPost] : [target],
          ),
        ),
      },
    };

    await expect(
      reflowFutureProductQueuePosts(ctx as never, {
        now: "2026-08-02T00:00:00.000Z",
        ownerId: "owner_1",
        productId: "product_1",
        queue: {
          revision: 2,
          schedulingHorizonDays: 90,
          weeklySlots: [{ dayOfWeek: 1, minuteOfDay: 600 }],
          timezone: "America/Detroit",
        } as never,
      }),
    ).resolves.toBe(1);
    expect(ctx.db.patch).toHaveBeenCalledWith("queue_post_doc", {
      queueSlotKey: undefined,
      updatedAt: "2026-08-02T00:00:00.000Z",
    });
    expect(ctx.db.patch.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.findAvailableSocialQueueSlot.mock.invocationCallOrder[0],
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "queue_post_doc",
      expect.objectContaining({
        scheduledFor: "2026-08-10T14:00:00.000Z",
      }),
    );
    expect(ctx.db.patch).not.toHaveBeenCalledWith(
      "exact_post_doc",
      expect.anything(),
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "target_doc",
      expect.objectContaining({
        nextAttemptAt: "2026-08-10T14:00:00.000Z",
      }),
    );
  });
});
