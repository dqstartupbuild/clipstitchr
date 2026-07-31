import { beforeEach, describe, expect, it, vi } from "vitest";
import { reviewAndResumeSocialPost } from "./reviewAndResumeSocialPost";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertOwnerCanPublishSocial: vi.fn(),
  findAvailableSocialQueueSlot: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  limit: vi.fn(),
  mutation: vi.fn((definition) => definition),
  refreshSocialPostStatus: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../billing/assertOwnerCanPublishSocial", () => ({
  assertOwnerCanPublishSocial: mocks.assertOwnerCanPublishSocial,
}));
vi.mock("../productSocialQueues/findAvailableSocialQueueSlot", () => ({
  findAvailableSocialQueueSlot: mocks.findAvailableSocialQueueSlot,
}));
vi.mock("../rateLimiter", () => ({
  rateLimiter: { limit: mocks.limit },
}));
vi.mock("./refreshSocialPostStatus", () => ({
  refreshSocialPostStatus: mocks.refreshSocialPostStatus,
}));

function createContext(scheduleMode: "product_queue" | "exact_time") {
  const post = {
    _id: "post_doc",
    id: "post_1",
    ownerId: "owner_1",
    productId: "product_1",
    scheduleMode,
  };
  const targets = [
    {
      _id: "target_doc",
      id: "target_1",
      socialAccountId: "account_1",
      platform: "instagram",
      publishMode: "direct",
      controlsJson: JSON.stringify({ consentAcknowledged: true }),
      status: "held",
    },
  ];
  const records: Record<string, unknown> = {
    socialPosts: post,
    socialAccounts: {
      _id: "account_doc",
      id: "account_1",
      status: "connected",
    },
    productSocialQueues: {
      _id: "queue_doc",
      productId: "product_1",
      paused: false,
      revision: 4,
      schedulingHorizonDays: 90,
      timezone: "America/Detroit",
      weeklySlots: [{ dayOfWeek: 1, minuteOfDay: 600 }],
    },
  };

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn((table: string) => {
        const index = { eq: vi.fn(() => index) };
        const chain = {
          collect: vi.fn(async () =>
            table === "socialPostTargets" ? targets : [],
          ),
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

describe("reviewAndResumeSocialPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
    mocks.assertOwnerCanPublishSocial.mockResolvedValue({ state: "active" });
    mocks.findAvailableSocialQueueSlot.mockResolvedValue({
      queueSlotKey: "product_1:2026-08-10T14:00:00.000Z",
      scheduledFor: "2026-08-10T14:00:00.000Z",
    });
  });

  it("moves a missed queue post into a new future slot only after review", async () => {
    const ctx = createContext("product_queue");
    const handler = (reviewAndResumeSocialPost as unknown as ConvexFunction)
      .handler;

    await expect(
      handler(ctx, {
        id: "post_1",
        consentAcknowledged: true,
        now: "2026-08-02T00:00:00.000Z",
      }),
    ).resolves.toEqual({
      resumedTargetCount: 1,
      scheduledFor: "2026-08-10T14:00:00.000Z",
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "target_doc",
      expect.objectContaining({
        status: "scheduled",
        nextAttemptAt: "2026-08-10T14:00:00.000Z",
      }),
    );
  });

  it("keeps an exact-time post held until the owner chooses a new time", async () => {
    const ctx = createContext("exact_time");
    const handler = (reviewAndResumeSocialPost as unknown as ConvexFunction)
      .handler;

    await expect(
      handler(ctx, {
        id: "post_1",
        consentAcknowledged: true,
        now: "2026-08-02T00:00:00.000Z",
      }),
    ).rejects.toThrow("Choose a new future time");
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("does not resume a post without fresh consent", async () => {
    const ctx = createContext("product_queue");
    const handler = (reviewAndResumeSocialPost as unknown as ConvexFunction)
      .handler;

    await expect(
      handler(ctx, {
        id: "post_1",
        consentAcknowledged: false,
        now: "2026-08-02T00:00:00.000Z",
      }),
    ).rejects.toThrow("confirm that you agree");
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
