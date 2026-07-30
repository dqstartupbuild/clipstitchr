import { beforeEach, describe, expect, it, vi } from "vitest";
import { markSocialAccountNeedsAttentionFromProvider } from "./markSocialAccountNeedsAttentionFromProvider";

type ConvexFunction = {
  handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  assertProviderWorkerSecret: vi.fn(),
  createNotification: vi.fn(),
  holdFutureTargetsForSocialAccount: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/assertProviderWorkerSecret", () => ({
  assertProviderWorkerSecret: mocks.assertProviderWorkerSecret,
}));
vi.mock("../createNotification", () => ({
  createNotification: mocks.createNotification,
}));
vi.mock("./holdFutureTargetsForSocialAccount", () => ({
  holdFutureTargetsForSocialAccount: mocks.holdFutureTargetsForSocialAccount,
}));

describe("markSocialAccountNeedsAttentionFromProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("holds future work and tells the owner to reconnect", async () => {
    const index = { eq: vi.fn(() => index) };
    const chain = {
      unique: vi.fn(async () => ({
        _id: "account_doc",
        id: "account_1",
        platform: "instagram",
      })),
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
      markSocialAccountNeedsAttentionFromProvider as unknown as ConvexFunction
    ).handler;

    await handler(ctx, {
      secret: "worker",
      ownerId: "owner_1",
      id: "account_1",
      errorMessage: "Instagram authorization expired.",
      now: "2026-08-01T00:00:00.000Z",
    });

    expect(mocks.holdFutureTargetsForSocialAccount).toHaveBeenCalledWith(ctx, {
      accountId: "account_1",
      now: "2026-08-01T00:00:00.000Z",
      ownerId: "owner_1",
      reason: "Reconnect this account, then review and resume the post.",
    });
    expect(mocks.createNotification).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        title: "Reconnect Instagram",
      }),
    );
  });
});
