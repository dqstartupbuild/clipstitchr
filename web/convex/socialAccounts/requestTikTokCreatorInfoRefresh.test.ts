import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestTikTokCreatorInfoRefresh } from "./requestTikTokCreatorInfoRefresh";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertOwnerCanPublishSocial: vi.fn(),
  enqueueSocialTargetProviderJob: vi.fn(),
  getAuthenticatedOwnerId: vi.fn(),
  limit: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));
vi.mock("../billing/assertOwnerCanPublishSocial", () => ({
  assertOwnerCanPublishSocial: mocks.assertOwnerCanPublishSocial,
}));
vi.mock("../rateLimiter", () => ({
  rateLimiter: { limit: mocks.limit },
}));
vi.mock("../socialPublishing/enqueueSocialTargetProviderJob", () => ({
  enqueueSocialTargetProviderJob: mocks.enqueueSocialTargetProviderJob,
}));

function createContext(capabilityCheckedAt?: string) {
  const account = {
    _id: "social_account_1",
    id: "account_1",
    ownerId: "owner_1",
    platform: "tiktok",
    status: "connected",
    capabilityCheckedAt,
  };
  const index = { eq: vi.fn(() => index) };
  const chain = {
    unique: vi.fn(async () => account),
    withIndex: vi.fn(
      (_name: string, callback: (value: typeof index) => void) => {
        callback(index);
        return chain;
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

describe("requestTikTokCreatorInfoRefresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_1");
    mocks.assertOwnerCanPublishSocial.mockResolvedValue({ state: "active" });
    mocks.enqueueSocialTargetProviderJob.mockResolvedValue({ id: "job_1" });
  });

  it("queues a current creator-info query even when the prior snapshot is fresh", async () => {
    const ctx = createContext("2026-08-01T00:04:00.000Z");
    const handler = (
      requestTikTokCreatorInfoRefresh as unknown as ConvexFunction
    ).handler;

    await expect(
      handler(ctx, {
        id: "account_1",
        now: "2026-08-01T00:05:00.000Z",
      }),
    ).resolves.toMatchObject({ queued: true, providerJobId: "job_1" });
    expect(mocks.assertOwnerCanPublishSocial).toHaveBeenCalledOnce();
    expect(mocks.limit).toHaveBeenCalledTimes(2);
    expect(ctx.db.patch).toHaveBeenCalledWith("social_account_1", {
      capabilitySnapshotJson: undefined,
      capabilityCheckedAt: undefined,
      lastErrorCode: undefined,
      lastErrorMessage: undefined,
      updatedAt: "2026-08-01T00:05:00.000Z",
    });
    expect(mocks.enqueueSocialTargetProviderJob).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        idempotencyKey:
          "social-capability:account_1:2026-08-01T00:05:00.000Z",
      }),
    );
  });

  it("checks entitlement and quota before queueing a provider refresh", async () => {
    const ctx = createContext();
    const handler = (
      requestTikTokCreatorInfoRefresh as unknown as ConvexFunction
    ).handler;

    await expect(
      handler(ctx, {
        id: "account_1",
        now: "2026-08-01T00:05:00.000Z",
      }),
    ).resolves.toMatchObject({ queued: true, providerJobId: "job_1" });
    expect(mocks.assertOwnerCanPublishSocial).toHaveBeenCalledOnce();
    expect(mocks.limit).toHaveBeenCalledTimes(2);
    expect(mocks.enqueueSocialTargetProviderJob).toHaveBeenCalledOnce();
  });
});
