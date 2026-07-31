import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveSocialCapabilitySnapshot } from "./saveSocialCapabilitySnapshot";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertProviderWorkerSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));

describe("saveSocialCapabilitySnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("restores a TikTok account after a successful creator-info query", async () => {
    const account = {
      _id: "social_account_doc",
      avatarUrl: "old-avatar",
      displayName: "Old name",
      id: "account_1",
      lastErrorCode: "capability_refresh_failed",
      lastErrorMessage: "Provider policy rejection.",
      ownerId: "owner_1",
      platform: "tiktok",
      status: "needs_attention",
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
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi.fn(() => chain),
      },
    };
    const handler = (saveSocialCapabilitySnapshot as unknown as ConvexFunction)
      .handler;

    await handler(ctx, {
      secret: "worker",
      ownerId: "owner_1",
      id: "account_1",
      capabilitySnapshotJson: '{"privacy_level_options":["SELF_ONLY"]}',
      displayName: "Creator",
      now: "2026-08-01T00:00:00.000Z",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "social_account_doc",
      expect.objectContaining({
        lastErrorCode: undefined,
        lastErrorMessage: undefined,
        status: "connected",
      }),
    );
  });
});
