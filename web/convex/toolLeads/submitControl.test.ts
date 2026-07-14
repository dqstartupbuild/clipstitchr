import { beforeEach, describe, expect, it, vi } from "vitest";
import { submitControl } from "./submitControl";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  rateLimiter: { limit: vi.fn(async () => ({ ok: true })) },
}));

vi.mock("../_generated/server", () => ({ mutation: vi.fn((value) => value) }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: mocks.rateLimiter }));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(existingEntry: unknown = null) {
  const indexQuery = { eq: vi.fn(() => indexQuery) };
  const queryChain = {
    unique: vi.fn(async () => existingEntry),
    withIndex: vi.fn((_name, callback) => {
      callback(indexQuery);
      return queryChain;
    }),
  };

  return {
    db: {
      insert: vi.fn(async () => "waitlist_1"),
      query: vi.fn(() => queryChain),
    },
  };
}

const validArgs = {
  clientKey: "a".repeat(64),
  email: " Founder@Example.COM ",
  name: " Ada Founder ",
  secret: "rate-limit-secret",
  source: "app-hook-generator" as const,
};

describe("control tool lead capture", () => {
  beforeEach(() => vi.clearAllMocks());

  it("preserves insert-if-new waitlist behavior and opaque output", async () => {
    const ctx = createContext();

    await expect(getHandler(submitControl)(ctx, validArgs)).resolves.toEqual({
      accepted: true,
    });
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "waitlist",
      expect.objectContaining({
        normalizedEmail: "founder@example.com",
        name: "Ada Founder",
      }),
    );
  });

  it("does not patch or duplicate an existing control lead", async () => {
    const ctx = createContext({ _id: "waitlist_1" });

    await expect(getHandler(submitControl)(ctx, validArgs)).resolves.toEqual({
      accepted: true,
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
