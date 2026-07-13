import { beforeEach, describe, expect, it, vi } from "vitest";
import { consume } from "./appHookGeneratorRateLimit";

type ConvexMutation = {
  handler: (
    ctx: unknown,
    args: { key: string; secret: string },
  ) => Promise<void>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
  rateLimiter: {
    limit: vi.fn(),
  },
}));

vi.mock("./_generated/server", () => ({
  mutation: mocks.mutation,
}));

vi.mock("./auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));

vi.mock("./rateLimiter", () => ({
  rateLimiter: mocks.rateLimiter,
}));

describe("appHookGeneratorRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("checks the shared secret and consumes client and global quota", async () => {
    const ctx = {};

    await (consume as unknown as ConvexMutation).handler(ctx, {
      key: "client_123",
      secret: "secret",
    });

    expect(mocks.assertRateLimitApiSecret).toHaveBeenCalledWith("secret");
    expect(mocks.rateLimiter.limit).toHaveBeenNthCalledWith(
      1,
      ctx,
      "appHookGeneratorByClient",
      { key: "client_123", throws: true },
    );
    expect(mocks.rateLimiter.limit).toHaveBeenNthCalledWith(
      2,
      ctx,
      "appHookGeneratorGlobal",
      { throws: true },
    );
  });
});
