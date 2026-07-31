import { beforeEach, describe, expect, it, vi } from "vitest";
import { acquireSocialTokenRefreshLock } from "./acquireSocialTokenRefreshLock";

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

describe("acquireSocialTokenRefreshLock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows a marked account to prove its connection with a token refresh", async () => {
    const account = {
      _id: "social_account_doc",
      id: "account_1",
      ownerId: "owner_1",
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
    const handler = (
      acquireSocialTokenRefreshLock as unknown as ConvexFunction
    ).handler;

    await expect(
      handler(ctx, {
        secret: "worker",
        ownerId: "owner_1",
        id: "account_1",
        lockId: "lock_1",
        lockedUntil: "2026-08-01T00:02:00.000Z",
        now: "2026-08-01T00:00:00.000Z",
      }),
    ).resolves.toBe(true);
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "social_account_doc",
      expect.objectContaining({ tokenRefreshLockId: "lock_1" }),
    );
  });
});
