import { beforeEach, describe, expect, it, vi } from "vitest";
import { findAvailableSocialQueueSlot } from "./findAvailableSocialQueueSlot";

const mocks = vi.hoisted(() => ({
  listSocialQueueSlotCandidates: vi.fn(),
}));

vi.mock("../../lib/clipstitchr/social/listSocialQueueSlotCandidates", () => ({
  listSocialQueueSlotCandidates: mocks.listSocialQueueSlotCandidates,
}));

function createContext(existingBySlot: Record<string, unknown>) {
  let currentSlot = "";
  const index = {
    eq: vi.fn((field: string, value: string) => {
      if (field === "queueSlotKey") {
        currentSlot = value;
      }
      return index;
    }),
  };
  const chain = {
    first: vi.fn(async () => existingBySlot[currentSlot] ?? null),
    withIndex: vi.fn(
      (_name: string, callback: (value: typeof index) => void) => {
        callback(index);
        return chain;
      },
    ),
  };

  return { db: { query: vi.fn(() => chain) } };
}

describe("findAvailableSocialQueueSlot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listSocialQueueSlotCandidates.mockReturnValue([
      "2026-08-03T14:00:00.000Z",
      "2026-08-04T14:00:00.000Z",
    ]);
  });

  it("skips a colliding logical queue slot", async () => {
    const firstKey = "product_1:2026-08-03T14:00:00.000Z";

    await expect(
      findAvailableSocialQueueSlot(
        createContext({ [firstKey]: { status: "scheduled" } }) as never,
        {
          after: "2026-08-01T00:00:00.000Z",
          horizonDays: 90,
          productId: "product_1",
          slots: [{ dayOfWeek: 1, minuteOfDay: 600 }],
          timezone: "America/Detroit",
        },
      ),
    ).resolves.toEqual({
      queueSlotKey: "product_1:2026-08-04T14:00:00.000Z",
      scheduledFor: "2026-08-04T14:00:00.000Z",
    });
  });

  it("allows a canceled post's slot to be reused", async () => {
    const firstKey = "product_1:2026-08-03T14:00:00.000Z";

    await expect(
      findAvailableSocialQueueSlot(
        createContext({ [firstKey]: { status: "canceled" } }) as never,
        {
          after: "2026-08-01T00:00:00.000Z",
          horizonDays: 90,
          productId: "product_1",
          slots: [{ dayOfWeek: 1, minuteOfDay: 600 }],
          timezone: "America/Detroit",
        },
      ),
    ).resolves.toMatchObject({ queueSlotKey: firstKey });
  });
});
