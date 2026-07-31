import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNextProductSocialQueueSlot } from "./getNextProductSocialQueueSlot";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertProductBelongsToOwner: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  listSocialQueueSlotCandidates: vi.fn(),
  query: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ query: mocks.query }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../assertProductBelongsToOwner", () => ({
  assertProductBelongsToOwner: mocks.assertProductBelongsToOwner,
}));
vi.mock("../../lib/clipstitchr/social/listSocialQueueSlotCandidates", () => ({
  listSocialQueueSlotCandidates: mocks.listSocialQueueSlotCandidates,
}));

function createContext() {
  let queueSlotKey = "";
  const queueIndex = { eq: vi.fn(() => queueIndex) };
  const postIndex = {
    eq: vi.fn((field: string, value: string) => {
      if (field === "queueSlotKey") {
        queueSlotKey = value;
      }
      return postIndex;
    }),
  };
  const queueChain = {
    unique: vi.fn(async () => ({
      ownerId: "owner_1",
      paused: false,
      productId: "product_1",
      schedulingHorizonDays: 90,
      timezone: "America/Detroit",
      weeklySlots: [{ dayOfWeek: 1, minuteOfDay: 600 }],
    })),
    withIndex: vi.fn(
      (_name: string, callback: (value: typeof queueIndex) => void) => {
        callback(queueIndex);
        return queueChain;
      },
    ),
  };
  const postChain = {
    first: vi.fn(async () =>
      queueSlotKey.endsWith("2026-08-03T14:00:00.000Z")
        ? { status: "scheduled" }
        : null,
    ),
    withIndex: vi.fn(
      (_name: string, callback: (value: typeof postIndex) => void) => {
        callback(postIndex);
        return postChain;
      },
    ),
  };

  return {
    db: {
      query: vi.fn((table: string) =>
        table === "productSocialQueues" ? queueChain : postChain,
      ),
    },
  };
}

describe("getNextProductSocialQueueSlot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
    mocks.listSocialQueueSlotCandidates.mockReturnValue([
      "2026-08-03T14:00:00.000Z",
      "2026-08-04T14:00:00.000Z",
    ]);
  });

  it("returns the next unoccupied logical product slot", async () => {
    const handler = (
      getNextProductSocialQueueSlot as unknown as ConvexFunction
    ).handler;

    await expect(
      handler(createContext(), {
        after: "2026-08-01T00:00:00.000Z",
        productId: "product_1",
      }),
    ).resolves.toEqual({
      queueSlotKey: "product_1:2026-08-04T14:00:00.000Z",
      scheduledFor: "2026-08-04T14:00:00.000Z",
    });
    expect(mocks.assertProductBelongsToOwner).toHaveBeenCalledWith(
      expect.anything(),
      "owner_1",
      "product_1",
    );
    expect(mocks.listSocialQueueSlotCandidates).toHaveBeenCalledWith({
      after: "2026-08-01T00:00:00.000Z",
      horizonDays: 90,
      slots: [{ dayOfWeek: 1, minuteOfDay: 600 }],
      timezone: "America/Detroit",
    });
  });
});
