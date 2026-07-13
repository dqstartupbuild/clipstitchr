import { beforeEach, describe, expect, it, vi } from "vitest";
import { submit } from "./submit";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  mutation: vi.fn((definition) => definition),
  rateLimiter: {
    limit: vi.fn(),
  },
}));

vi.mock("../_generated/server", () => ({
  mutation: mocks.mutation,
}));

vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));

vi.mock("../rateLimiter", () => ({
  rateLimiter: mocks.rateLimiter,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(existingEntry: unknown = null) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const queryChain = {
    unique: vi.fn(async () => existingEntry),
    withIndex: vi.fn(
      (_indexName: string, callback: (query: typeof indexQuery) => void) => {
        callback(indexQuery);
        return queryChain;
      },
    ),
  };

  return {
    db: {
      insert: vi.fn(async () => "lead_1"),
      patch: vi.fn(),
      query: vi.fn(() => queryChain),
    },
  };
}

const validArgs = {
  clientKey: "a".repeat(64),
  email: " Founder@Example.COM ",
  name: "  Ada   Founder  ",
  secret: "rate-limit-secret",
  source: "app-ugc-brief-builder" as const,
};

describe("tool lead submit mutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimiter.limit.mockResolvedValue({ ok: true });
  });

  it("consumes every dedicated limit before inserting a normalized lead", async () => {
    const ctx = createContext();

    await expect(getHandler(submit)(ctx, validArgs)).resolves.toEqual({
      accepted: true,
    });
    expect(mocks.assertRateLimitApiSecret).toHaveBeenCalledWith(
      "rate-limit-secret",
    );
    expect(mocks.rateLimiter.limit).toHaveBeenNthCalledWith(
      1,
      ctx,
      "toolLeadSubmitByClient",
      { key: "a".repeat(64), throws: true },
    );
    expect(mocks.rateLimiter.limit).toHaveBeenNthCalledWith(
      2,
      ctx,
      "toolLeadSubmitByEmail",
      { key: "founder@example.com", throws: true },
    );
    expect(mocks.rateLimiter.limit).toHaveBeenNthCalledWith(
      3,
      ctx,
      "toolLeadSubmitGlobal",
      { throws: true },
    );
    expect(
      mocks.rateLimiter.limit.mock.invocationCallOrder.at(-1),
    ).toBeLessThan(ctx.db.query.mock.invocationCallOrder[0]);
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "waitlist",
      expect.objectContaining({
        email: "founder@example.com",
        name: "Ada Founder",
        normalizedEmail: "founder@example.com",
        source: "app-ugc-brief-builder",
      }),
    );
  });

  it("accepts an existing email without patching or revealing it", async () => {
    const ctx = createContext({ _id: "waitlist_1" });

    await expect(
      getHandler(submit)(ctx, {
        ...validArgs,
        source: "ad-variant-calculator",
      }),
    ).resolves.toEqual({ accepted: true });
    expect(mocks.rateLimiter.limit).toHaveBeenCalledTimes(3);
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("rejects invalid details before consuming quota or reading data", async () => {
    const ctx = createContext();

    await expect(
      getHandler(submit)(ctx, { ...validArgs, clientKey: "spoofed" }),
    ).rejects.toThrow("Invalid client key.");
    await expect(
      getHandler(submit)(ctx, { ...validArgs, email: "not-an-email" }),
    ).rejects.toThrow("Invalid lead details.");
    expect(mocks.rateLimiter.limit).not.toHaveBeenCalled();
    expect(ctx.db.query).not.toHaveBeenCalled();
  });

  it("requires the server secret before validation or quota", async () => {
    const ctx = createContext();
    mocks.assertRateLimitApiSecret.mockImplementationOnce(() => {
      throw new Error("Not authorized");
    });

    await expect(getHandler(submit)(ctx, validArgs)).rejects.toThrow(
      "Not authorized",
    );
    expect(mocks.rateLimiter.limit).not.toHaveBeenCalled();
    expect(ctx.db.query).not.toHaveBeenCalled();
  });
});
