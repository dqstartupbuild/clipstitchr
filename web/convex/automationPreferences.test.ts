import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { save } from "./automationPreferences";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertDailyDraftProductLimit: vi.fn(),
  assertProductBelongsToOwner: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  query: vi.fn((definition) => definition),
  rateLimit: vi.fn(),
}));

vi.mock("./_generated/server", () => ({
  mutation: mocks.mutation,
  query: mocks.query,
}));
vi.mock("./auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("./assertProductBelongsToOwner", () => ({
  assertProductBelongsToOwner: mocks.assertProductBelongsToOwner,
}));
vi.mock("./automation/assertDailyDraftProductLimit", () => ({
  assertDailyDraftProductLimit: mocks.assertDailyDraftProductLimit,
}));
vi.mock("./rateLimiter", () => ({
  rateLimiter: { limit: mocks.rateLimit },
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createSaveArgs(updatedAt: string) {
  return {
    avatarSelectionMode: "all",
    enabled: true,
    enabledTools: [],
    productId: "product_1",
    productSelectionMode: "selected",
    selectedAvatarIds: [],
    selectedProductIds: ["product_1"],
    updatedAt,
  };
}

describe("automationPreferences save", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cannot use a historical client timestamp to enable expired daily drafts", async () => {
    const serverNow = "2026-07-16T12:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(serverNow);
    mocks.assertDailyDraftProductLimit.mockImplementationOnce(
      async (
        _ctx: unknown,
        _ownerId: string,
        _productId: string,
        checkedAt: string,
      ) => {
        expect(checkedAt).toBe(serverNow);
        throw new Error("Subscription inactive");
      },
    );

    await expect(
      getHandler(save)({}, createSaveArgs("2000-01-01T00:00:00.000Z")),
    ).rejects.toThrow("Subscription inactive");
    expect(mocks.assertDailyDraftProductLimit).toHaveBeenCalledWith(
      {},
      "owner_123",
      "product_1",
      serverNow,
    );
    expect(mocks.rateLimit.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.assertProductBelongsToOwner.mock.invocationCallOrder[0],
    );
    expect(mocks.rateLimit).toHaveBeenCalledWith({}, "convexRecordSave", {
      key: "owner_123",
      throws: true,
    });
  });
});
