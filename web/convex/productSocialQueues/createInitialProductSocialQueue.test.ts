import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialProductSocialQueue } from "./createInitialProductSocialQueue";

const mocks = vi.hoisted(() => ({
  getSocialSchedulingHorizonDays: vi.fn(() => 90),
}));

vi.mock("../../lib/clipstitchr/social/getSocialSchedulingHorizonDays", () => ({
  getSocialSchedulingHorizonDays: mocks.getSocialSchedulingHorizonDays,
}));

function createContext(existing: Record<string, unknown> | null) {
  const query = {
    unique: vi.fn(async () => existing),
    withIndex: vi.fn(() => query),
  };

  return {
    db: {
      insert: vi.fn(async () => "queue_document_1"),
      query: vi.fn(() => query),
    },
  };
}

describe("createInitialProductSocialQueue", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates one paused UTC queue with the scheduling horizon", async () => {
    const ctx = createContext(null);

    await expect(
      createInitialProductSocialQueue(
        ctx as never,
        "owner_1",
        "product_1",
        "2026-07-29T00:00:00.000Z",
      ),
    ).resolves.toBe("queue_document_1");

    expect(ctx.db.insert).toHaveBeenCalledWith("productSocialQueues", {
      ownerId: "owner_1",
      productId: "product_1",
      timezone: "UTC",
      weeklySlots: [],
      paused: true,
      schedulingHorizonDays: 90,
      revision: 1,
      createdAt: "2026-07-29T00:00:00.000Z",
      updatedAt: "2026-07-29T00:00:00.000Z",
    });
  });

  it("returns the existing queue instead of creating a duplicate", async () => {
    const ctx = createContext({ _id: "existing_queue_1" });

    await expect(
      createInitialProductSocialQueue(
        ctx as never,
        "owner_1",
        "product_1",
        "2026-07-29T00:00:00.000Z",
      ),
    ).resolves.toBe("existing_queue_1");

    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
