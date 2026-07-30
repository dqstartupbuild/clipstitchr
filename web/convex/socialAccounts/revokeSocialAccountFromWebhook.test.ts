import { beforeEach, describe, expect, it, vi } from "vitest";
import { revokeSocialAccountFromWebhook } from "./revokeSocialAccountFromWebhook";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  createNotification: vi.fn(),
  detachSocialAccountDefaults: vi.fn(),
  holdFutureTargetsForSocialAccount: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));
vi.mock("../createNotification", () => ({
  createNotification: mocks.createNotification,
}));
vi.mock("./detachSocialAccountDefaults", () => ({
  detachSocialAccountDefaults: mocks.detachSocialAccountDefaults,
}));
vi.mock("./holdFutureTargetsForSocialAccount", () => ({
  holdFutureTargetsForSocialAccount: mocks.holdFutureTargetsForSocialAccount,
}));

describe("revokeSocialAccountFromWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revokes every owner connection for the provider account", async () => {
    const accounts = [
      {
        _id: "account_doc_1",
        id: "account_1",
        ownerId: "owner_1",
      },
      {
        _id: "account_doc_2",
        id: "account_2",
        ownerId: "owner_2",
      },
    ];
    const index = { eq: vi.fn(() => index) };
    const query = {
      collect: vi.fn(async () => accounts),
      withIndex: vi.fn(
        (_name: string, callback: (value: typeof index) => void) => {
          callback(index);
          return query;
        },
      ),
    };
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi.fn(() => query),
      },
    };
    const handler = (
      revokeSocialAccountFromWebhook as unknown as ConvexFunction
    ).handler;

    await expect(
      handler(ctx, {
        secret: "rate-secret",
        platform: "instagram",
        externalAccountId: "ig_123",
        redactedAccessTokenCiphertext: "redacted",
        tokenEncryptionVersion: 2,
        reason: "Authorization removed.",
        now: "2026-08-01T00:00:00.000Z",
      }),
    ).resolves.toEqual(["owner_1", "owner_2"]);
    expect(ctx.db.patch).toHaveBeenCalledTimes(2);
    expect(mocks.detachSocialAccountDefaults).toHaveBeenCalledWith(
      ctx,
      "owner_2",
      "account_2",
    );
    expect(mocks.holdFutureTargetsForSocialAccount).toHaveBeenCalledTimes(2);
    expect(mocks.createNotification).toHaveBeenCalledTimes(2);
  });
});
