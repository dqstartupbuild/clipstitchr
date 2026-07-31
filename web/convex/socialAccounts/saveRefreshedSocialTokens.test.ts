import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveRefreshedSocialTokens } from "./saveRefreshedSocialTokens";

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

describe("saveRefreshedSocialTokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("restores a marked account when its token refresh succeeds", async () => {
    const account = {
      _id: "social_account_doc",
      id: "account_1",
      ownerId: "owner_1",
      platform: "tiktok",
      refreshTokenCiphertext: "old_refresh",
      status: "needs_attention",
      tokenRefreshLockId: "lock_1",
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
    const handler = (saveRefreshedSocialTokens as unknown as ConvexFunction)
      .handler;

    await handler(ctx, {
      secret: "worker",
      ownerId: "owner_1",
      id: "account_1",
      lockId: "lock_1",
      accessTokenCiphertext: "new_access",
      accessTokenExpiresAt: "2026-08-01T01:00:00.000Z",
      refreshTokenCiphertext: "new_refresh",
      refreshTokenExpiresAt: "2027-08-01T00:00:00.000Z",
      tokenEncryptionVersion: 1,
      now: "2026-08-01T00:00:00.000Z",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "social_account_doc",
      expect.objectContaining({
        accessTokenCiphertext: "new_access",
        lastErrorCode: undefined,
        lastErrorMessage: undefined,
        status: "connected",
      }),
    );
  });
});
